import { Session } from '@supabase/supabase-js'
import { View, Text, Image } from 'react-native'
import OrderButton from './OrderButton';
import RewardsButton from './RewardsButton';
import { styles } from './styles';
import { supabase } from '../../lib/supabase';
import React, { useEffect, useState } from 'react';
import Swiper from 'react-native-swiper';

const FetchUsername = ({email, id}: {email: string | undefined, id: string | undefined}) => {
    const [username, setUsername] = useState('')

    useEffect(() => {
        const fetchUsername = async () => {
            // Currently does not work cause email not stored in database
            const {data, error} = await supabase.from('users')
                .select('username').eq('id', id).single()

            console.log(data)

            setUsername(data?.username || email)
        }
        fetchUsername()
    })

    return (
        <View>
        <Text style={styles.welcometext}>Welcome, {username}!</Text>
        <Text style={styles.welcome}>Want a drink or a snack? Bro has got you covered!</Text>
        </View>
    )
}

const SlidingWindow = () => {
    const [images, setImages] = useState<string[]>([])
    const [index, setIndex] = useState(0);


    const filePaths = ['Milocino.jpg', 'calbeepotatochipshotandspicy.jpg',
        'camelpistachios.jpg', 'layssourcreamandonion.jpg', 'doritosnachocheese.jpg',
        'IcedCoffee.jpg'
    ]

    useEffect(() => {
        // is this even necessary lol ?!
        const fetchImages = async () => {
            const results = await Promise.all(filePaths.map(async (file) => {
                const { data } = await supabase.storage
                .from('MenuItemImages')
                .getPublicUrl(file);

                return data?.publicUrl
            }))

            setImages(results)
        }
        fetchImages()
    })

    return (
        //Sliding component
        <Swiper style={styles.wrapper} showsPagination={false} loop={false}>
            {images?.map(image => (
                <View testID='Test' key={image} style={styles.slide}>
                    <Image source={{ uri: image }} style={styles.image} />
                </View>
            ))}
        </Swiper>
    )
}

export default function Home({ session }: { session: Session }) {
    return (
        <View style={{ flex: 1, alignItems: 'center' }}>
            <Image source={require('../../assets/brospot.png')} style={{ marginTop: 20, width: 180, height: 130 }}/>
            <View style={{height: 200, marginTop: 20, marginBottom: 25}}>
                <SlidingWindow/>
            </View>
            <FetchUsername email={session.user.email} id={session.user.id}/>
            <RewardsButton />
            <OrderButton />
        </View>
    );
}
