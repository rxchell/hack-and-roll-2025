import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { StyleSheet } from 'react-native'
import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator, } from 'react-native';
import { Button, Input } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { styles } from './styles';
import { render } from 'react-dom';
import RedeemButton from './RedeemButton';
import { Ionicons } from '@expo/vector-icons';

interface Voucher {
    id: number
    name: string
    description: string
    type: string 
    discount: number
    cost: number
}

export default function Voucher({ session }: { session: Session }) {
    const [vouchers, setVouchers] = useState<Voucher[]>([])
    const [loading, setLoading] = useState(true)
    const [points, setPoints] = useState(0)

    useEffect(() => {
        fetchUserVouchers(); 
        fetchUserPoints();
    }, []);

    async function fetchUserPoints() {
        if (!session?.user) throw new Error('No user on the session!')
        try {
            const user_id = session.user.id
            const {data, error} = await supabase.from('users')
            .select('points')
            .eq('id', user_id).single()

            if (error) throw new Error(error.message)

            setPoints(data?.points)
        } catch (error) {
            console.log(error)
        }
    } 


    async function fetchUserVouchers() {
        if (!session?.user) throw new Error('No user on the session!')
        try {
            const user_id = session.user.id
            const { data, error } = await supabase
            .from('Vouchers')
            .select(`
                id, name, description, type, discount, cost
            `)

            
            if (data != null) {

                setVouchers(data)   
            }

            if (error) throw new Error(error.message)

             
        } catch (error) {
            console.error('Error updating quantity:', error);
        } finally {
            setLoading(false);
        }  
    }
    
    const renderVoucher = ({ item }: { item: Voucher }) => {
        type IconName = 'wallet-outline' | 'pricetags-outline' | 'card-outline' | 'gift-outline'
                        | 'bag-add-outline'
        const icons: IconName[] = ['wallet-outline', 'pricetags-outline', 'card-outline', 'gift-outline'
            , 'bag-add-outline'
        ]
        const randomIndex = Math.floor(Math.random() * icons.length)
        const icon: IconName = icons[randomIndex]

        return (
            <View style={styles.voucher}>
                <View style={styles.columnLeft}>
                    <View style={styles.row}>
                        <Text style={styles.name}>{item.name}</Text>
                    </View>
                    <Text>Description: {item.description}</Text>
                    <RedeemButton/>
                    <Text>Cost: {item.cost}</Text>
                </View>
                <View style={styles.columnRight}>
                    <Ionicons name={icon} size={90}></Ionicons>
                </View>
            </View>
        );
    }

    if (loading) {
        return <Text>Loading menu...</Text>;
    }

    return (
        <View>
            <Text style={styles.title}>Number of Points: {points}</Text>
            <Text style={styles.subtitle}>Here is a list of vouchers!</Text>
            <FlatList 
            data={vouchers}
            renderItem={renderVoucher}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.container}/>
        </View>
    )
}