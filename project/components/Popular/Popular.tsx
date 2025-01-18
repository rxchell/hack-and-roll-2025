import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { View, Text, Image, FlatList } from 'react-native';
import { supabase } from '../../lib/supabase';
import { styles } from './styles';

export default function Popular({ session }: { session: Session }) {
    const [PopularData, setPopularData] = useState<any[]>([]);

    useEffect(() => {
        fetchPopularData();
    }, []);

    const fetchPopularData = async () => {
        // Fetch the Menu items data from Supabase
        const { data, error } = await supabase
            .from('Menu') // Menu items
            .select('image, description, total')
            .order('total', { ascending: false }); // Sort by 'total' in descending order
        //console.debug(data);
        if (error) {
            console.error(error);
            return;
        }

        // Generate full URLs for the images in Supabase Storage (assuming they're in a 'public' bucket)

        const updatedData = data.map((item: any) => ({
            ...item,
            imageUrl: supabase.storage.from('MenuItemImages').getPublicUrl(item.image).data.publicUrl, // Get images from bucket
        }));
        setPopularData(updatedData || []);
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.welcometext}>Popular items</Text>

            {/* List of leaderboard images */}
            <FlatList
                data={PopularData}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                        <Image
                            source={{ uri: item.imageUrl }} // Use the public URL for the image
                            style={{ width: 80, height: 80, marginRight: 10 }} // Customize image style as needed
                        />
                        <View>
                            <Text style={styles.description}>{item.description}</Text>
                            <Text style={styles.total}>Total Bought: {item.total}</Text>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

