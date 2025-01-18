import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useRoute } from '@react-navigation/native';
import { styles } from './styles';
import ConfirmOrderButton from './ConfirmOrderButton';

export default function Order({ session }: { session: Session }) {

    interface OrderItem {
        menuItem_id: string;
        quantity: number;
        Menu: {
          name: string;
          cost: number;
        };
      }

    const route = useRoute();
    const { orderId } = route.params as { orderId: string } || {};  
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      if (orderId) {
        fetchOrderDetails();
      }
    }, [orderId]);
  
    const fetchOrderDetails = async () => {
      try {
        const { data: orderItemsData, error: orderItemsError } = await supabase
          .from('OrderItems_testing')
          .select('menuItem_id, quantity')
          .eq('order_id', orderId);
  
        if (orderItemsError) throw new Error(orderItemsError.message);
  
        const menuItemsPromises = orderItemsData.map(async (orderItem) => {
          const { data: menuItemData, error: menuItemError } = await supabase
            .from('Menu')
            .select('name, cost')
            .eq('id', orderItem.menuItem_id)
            .single();
  
          if (menuItemError) throw new Error(menuItemError.message);
  
          return {
            ...orderItem,
            Menu: menuItemData,
          };
        });
  
        const menuItems = await Promise.all(menuItemsPromises);
        setOrderItems(menuItems);
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };
  
    if (!orderId) {
      return (
        <View style={styles.container}>
          <Text style={styles.errorText}>No order provided. Please add items into your order.</Text>
        </View>
      );
    }
  
    if (loading) {
      return <ActivityIndicator size="large" color="#ff9e4d" />;
    }
  
    return (
      <View style={styles.ordercontainer}>
        <Text style={styles.title}>Please confirm your order.</Text>
        <Text style={styles.subtitle}>Order ID: {orderId}</Text>
        <FlatList
          data={orderItems}
          keyExtractor={(item) => item.menuItem_id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.ordername}>{item.Menu.name}</Text>
              <Text style={styles.quantity}>Quantity: {item.quantity}</Text>
              <Text style={styles.ordercost}>Cost: ${item.Menu.cost * item.quantity}</Text>
            </View>
          )}
        />
        <ConfirmOrderButton/>
      </View>
    );
}