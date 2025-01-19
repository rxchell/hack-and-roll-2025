import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useRoute } from '@react-navigation/native';
import { styles } from './styles';
import ConfirmOrderButton from './ConfirmOrderButton';
// import Payment from '../Payment/Payment';
import VoucherButton from '../Voucher/VoucherButton';

export default function Order({ session }: { session: Session }) {
    const route = useRoute();
    let { orderId } = route.params as { orderId: string } || {};

    interface OrderItem {
        menuItem_id: string;
        quantity: number;
        Menu: {
          name: string;
          cost: number;
        };
      }

      
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCost, setTotalCost] = useState(0)

    useEffect(() => {
      if (orderId) {
        const interval = setInterval(() => {
          fetchOrderDetails(); // Fetch details periodically
        }, 1000); 
        return () => clearInterval(interval);
      }
    }, [orderId, totalCost]);

    const total_text = () => {
      return(<Text style={styles.totalCost}>Total: ${totalCost.toFixed(2)}</Text>)
    }

    const calculateCostWithVoucher = async (orderId: string, totalCost: number) => {
      try {
        const {data, error} = await supabase.from('Orders_testing')
        .select('active_voucher').eq('id', orderId).single()

        if (data?.active_voucher) {
          return totalCost - 1
        }
        return totalCost

      } catch (error) {
        return totalCost
      }
    }
    
    const fetchOrderDetails = async () => {
      try {
        const {data: status, error} = await supabase.from('Orders_testing')
              .select('payment_completed').eq('id', orderId).single()

        if (status?.payment_completed == true) {
          // clear order
          orderId = ''
        } else if (orderId != '') {
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
          
          const totalCost = menuItems.reduce((sum, item) => {
            return sum + (item.Menu.cost * item.quantity);
          }, 0);

          const finalTotalCost = await calculateCostWithVoucher(orderId, totalCost)

          setTotalCost(finalTotalCost);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };
  
    if (!orderId || orderItems.length === 0) {
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
        <View>
          {total_text()}
        </View>
        <VoucherButton orderId={orderId}/>
        {/* <Payment/> */}
      </View>
    );
}