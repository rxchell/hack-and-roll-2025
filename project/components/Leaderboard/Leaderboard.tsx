import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { View, Text, Image, FlatList, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { styles } from './styles';
import React from 'react';

export default function Leaderboard({ session }: { session: Session }) {
    const [usersLeaderboardData, setUsersLeaderboardData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboardData();
    }, []);

    const fetchLeaderboardData = async () => {
        if (!session?.user) {
            Alert.alert('Error', 'No user found in session');
            return;
        }

        try {
            setLoading(true);
            // pull from "users" table (user_ids and usernames)
            const { data: users, error: usersError } = await supabase
                .from('users')
                .select('id, username, lifetime_points');
            
            if (usersError) {
                console.error(usersError);
                return;
            }

            if (!users || users.length === 0) {
                console.log('No users found.');
                return;
            }

            const usersWithFavoriteItems = await Promise.all(users.map(async (user: any) => {
                // pull orders for this user after November 27th, 2024
                const { data: orders, error: ordersError } = await supabase
                    .from('Orders_testing')
                    .select('id')
                    .eq('user_id', user.id)
                    .gte('created_at', '2024-11-27T00:00:00Z'); // Orders after Nov 27, 2024
                
                if (ordersError) {
                    console.error(ordersError);
                    return user;
                }

                if (!orders || orders.length === 0) {
                    return user; // No orders, skip to next user
                }

                // pull orderitems that belong to these orders
                const orderIds = orders.map((order: any) => order.id);
                const { data: orderItems, error: orderItemsError } = await supabase
                    .from('OrderItems_testing')
                    .select('menuItem_id, quantity')
                    .in('order_id', orderIds); // pull order items
                if (orderItemsError) {
                    console.error(orderItemsError);
                    return user;
                }

                // Sum quantity for each menuitem_id
                const itemQuantities: Record<string, number> = {};
                orderItems.forEach((item: any) => {
                    if (itemQuantities[item.menuItem_id]) {
                        itemQuantities[item.menuItem_id] += item.quantity;
                    } else {
                        itemQuantities[item.menuItem_id] = item.quantity;
                    }
                });

                // Find the menuitem_id with the highest total quantity
                const favoriteMenuItemId = Object.keys(itemQuantities).reduce((maxId, currentId) => {
                    return itemQuantities[currentId] > (itemQuantities[maxId] || 0) ? currentId : maxId;
                }, '');

                if (favoriteMenuItemId) {
                    //Add the favorite menuitem_id to the user object
                    const { data: menuItem, error: menuItemError } = await supabase
                        .from('Menu')
                        .select('image')
                        .eq('id', favoriteMenuItemId)
                        .single(); //Pull the image for the favorite menu item
                    
                    if (menuItemError) {
                        console.error(menuItemError);
                        return user;
                    }

                    // Add the favorite item to the user object
                    user.favorite_item = favoriteMenuItemId;
                    user.favorite_item_image = menuItem.image;
                }
                //console.debug(supabase.storage.from('MenuItemImages').getPublicUrl(user.favorite_item_image).data.publicUrl);

                return user;
            }));

            // Sort users by lifetime_points in descending order
            usersWithFavoriteItems.sort((a, b) => b.lifetime_points - a.lifetime_points);

            // Set leaderboard data
            setUsersLeaderboardData(usersWithFavoriteItems);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Text>Loading leaderboard...</Text>;
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.welcometext}>Leaderboard</Text>

            {/* List of leaderboard users */}
            <FlatList
                data={usersLeaderboardData}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                        <Image
                            source={{ uri: supabase.storage.from('MenuItemImages').getPublicUrl(item.favorite_item_image).data.publicUrl }} 
                            style={{ width: 80, height: 80, marginRight: 10 }} // Customize image style as needed
                        />
                        <View>
                            <Text style={styles.username}>
                                {item.username || `User ID: ${item.id}`}
                            </Text>
                            <Text style={styles.lifetimePoints}>Lifetime Points: {item.lifetime_points}</Text>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}