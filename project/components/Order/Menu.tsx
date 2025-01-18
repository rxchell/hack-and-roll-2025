import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Button, Tab } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { View, Text, Image, FlatList, Alert, } from 'react-native';
import { styles } from './styles';

interface MenuItem {
  id: string;
  name: string;
  type: string;
  description: string;
  image: string;
  imageUrl: string;
  cost: number;
}

import { useNavigation } from '@react-navigation/native';
import * as React from "react"; // or


export default function Menu({ session }: { session: Session }) {
  const navigation = useNavigation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => { fetchMenuItems();
  }, []);

  async function fetchMenuItems() {
  if (!session?.user) throw new Error('No user on the session!')
  try {
    const { data, error } = await supabase.from('Menu').select('*');
    if (error) throw new Error(error.message);

    // Fetch URLs for images
    const itemsWithUrls = await Promise.all(
    data.map(async (item: MenuItem) => {
      const { data: imageUrl } = await supabase.storage
      .from('MenuItemImages')
      .getPublicUrl(item.image);
      if (!imageUrl) throw new Error('Error fetching image URL');

      return {
      ...item,
      imageUrl: imageUrl.publicUrl,
      };
    })
    );

    setMenuItems(itemsWithUrls);
  } catch (error) {
    if (error instanceof Error) {
    console.error('Error fetching menu items:', error.message);
    } else {
    console.error('Error fetching menu items:', error);
    }
  } finally {
    setLoading(false);
  }
  }

  const filterMenuItems = () => {
  if (selectedCategory === 'All') {
    return menuItems;
  }
  return menuItems.filter(item => item.type === selectedCategory);
  };

  const categories = ['All', ...new Set(menuItems.map(item => item.type))];

  
  const renderCategoryButtons = () => {
    return (
      <Tab
        value={categories.indexOf(selectedCategory)}
        onChange={(e) => setSelectedCategory(categories[e])}
        indicatorStyle={{ backgroundColor: '#ff9e4d' }}
        scrollable
      >
        {categories.map((category, index) => (
          <Tab.Item
            key={index}
            title={category}
            titleStyle={{ color: selectedCategory === category ? '#ff9e4d' : 'black' }}
          />
        ))}
      </Tab>
    );
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return; // Prevent negative quantities

    setQuantities((prev) => ({ ...prev, [itemId]: newQuantity }));

    try {
      if (newQuantity === 0) {
      await supabase.from('OrderItems_testing').delete().eq('menuItem_id', itemId);
      } else {
      await supabase.from('OrderItems_testing').upsert({
        menuItem_id: itemId,
        quantity: newQuantity,
      });
      }
    } catch (error) {
      if (error instanceof Error) {
      console.error('Error updating quantity:', error.message);
      } else {
      console.error('Error updating quantity:', error);
      }
    }
  };

  const createOrder = async () => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('Orders_testing')
        .insert({ user_id: session.user.id, created_at: new Date() })
        .select();
  
      if (orderError) throw new Error(orderError.message);
  
      const orderId = orderData[0].id;
  
      const orderItems = Object.entries(quantities)
        .filter(([_, quantity]) => quantity > 0)
        .map(([itemId, quantity]) => ({
          menuItem_id: itemId,
          order_id: orderId,
          quantity,
        }));
  
      if (orderItems.length > 0) {
        const { error: itemsError } = await supabase.from('OrderItems_testing').insert(orderItems);
        if (itemsError) throw new Error(itemsError.message);
      }
  
      // Pass the `orderId` to the order page
      navigation.navigate('Order', { orderId });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error creating order:', error.message);
        Alert.alert('Error', error.message);
      } else {
        console.error('Error creating order:', error);
        Alert.alert('Error', 'An unknown error occurred');
      }
    }
  };
  
  const renderMenuItem = ({ item }: { item: MenuItem & { imageUrl: string } }) => {
  const quantity = quantities[item.id] || 0;
  const formattedCost = item.cost.toFixed(2);

  return (
    <View style={styles.menuItem}>
    <Image source={{ uri: item.imageUrl }} style={styles.image} />
    <View style={styles.textContainer}>
      <View style={styles.row}>
      <Text style={[styles.name, { flexWrap: 'wrap' }]}>{item.name}</Text>
      <Text style={[styles.cost, { flex: 1, textAlign: 'right' }]}>${formattedCost}</Text>
      </View>
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.quantityContainer}>
        <Button title="-" buttonStyle={styles.button} onPress={() => updateQuantity(item.id, quantity - 1)} />
        <Text style={styles.quantityText}>{quantity}</Text>
        <Button title="+" buttonStyle={styles.button} onPress={() => updateQuantity(item.id, quantity + 1)} />
      </View>
    </View>
    </View>
  );
  };

  if (loading) {
  return <Text>Loading menu...</Text>;
  }

  return (
    <View>
      {renderCategoryButtons()}
      <FlatList
      data={filterMenuItems()}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderMenuItem}
      contentContainerStyle={styles.container}
      ListFooterComponent={
        <Button buttonStyle={styles.confirmButton} title="Create Order" onPress={createOrder} color="#ff9e4d" />
      }
      />
    </View>
  );
}
