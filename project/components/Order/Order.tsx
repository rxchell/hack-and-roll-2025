import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, AppState } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRoute, useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import ConfirmOrderButton from './ConfirmOrderButton';
import PaymentOptions from '../Payment/Payment';
import VoucherButton from '../Voucher/VoucherButton';

export default function Order() {
    const route = useRoute();
    const navigation = useNavigation();
    const { orderId } = route.params || {};  // Safe destructuring

    // Ensure orderId exists
    if (!orderId) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No order provided. Please add items to your order.</Text>
            </View>
        );
    }

    interface OrderItem {
        menuItem_id: string;
        quantity: number;
        Menu: {
            name: string;
            cost: number;
        };
    }

    interface Voucher {
        id: number;
        name: string;
        discount: number;
    }

    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCost, setTotalCost] = useState(0);
    const [voucher, setVoucher] = useState<Voucher | null>(null);

    useEffect(() => {
        if (orderId) fetchOrderDetails();
        
        // Handle app state changes (when app goes to background or inactive)
        const appStateListener = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                clearOrder();
            }
        });

        // Cleanup listener when component unmounts
        return () => appStateListener.remove();
    }, [orderId]);

    const calculateCostWithVoucher = async (orderId: string, totalCost: number) => {
        try {
            const { data, error } = await supabase.from('Orders_testing')
                .select('active_voucher').eq('id', orderId).single();

            if (data?.active_voucher) {
                return totalCost - 1; // Assuming $1 off for simplicity
            }
            return totalCost;

        } catch (error) {
            return totalCost;
        }
    };

    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const { data: orderItemsData, error } = await supabase
                .from('OrderItems_testing')
                .select('menuItem_id, quantity')
                .eq('order_id', orderId);

            if (error) throw error;

            const menuItems = await Promise.all(
                orderItemsData.map(async (item) => {
                    const { data: menuItemData, error } = await supabase
                        .from('Menu')
                        .select('name, cost')
                        .eq('id', item.menuItem_id)
                        .single();

                    if (error) throw error;
                    return { ...item, Menu: menuItemData };
                })
            );

            const total = menuItems.reduce(
                (sum, item) => sum + item.Menu.cost * item.quantity,
                0
            );

            const finalTotal = await calculateCostWithVoucher(orderId, total);
            setOrderItems(menuItems);
            setTotalCost(finalTotal);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch order details.');
            console.error('Error fetching order details:', error);
        } finally {
            setLoading(false);
        }
    };

    // Clear the order state
    const clearOrder = () => {
        setOrderItems([]);
        setVoucher(null);
        setTotalCost(0);
    };

    // Complete the order and update backend
    const completeOrder = async () => {
        try {
            clearOrder();  // Clear order locally
            Alert.alert('Success', 'Order completed!');
            navigation.navigate('Home');  // Navigate to home after completion
        } catch (error) {
            console.error('Error completing order:', error);
            Alert.alert('Error', 'Failed to complete the order.');
        }
    };

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
            <Text style={styles.totalCost}>Total: ${totalCost.toFixed(2)}</Text>
            <VoucherButton orderId={orderId} onVoucherApplied={fetchOrderDetails} />
            <Text style={styles.voucherInfo}>
                {voucher ? `$1 OFF applied` : 'No voucher applied'}
            </Text>
            <PaymentOptions orderId={orderId} totalCost={totalCost} onPaymentSuccess={completeOrder} />
        </View>
    );
}
