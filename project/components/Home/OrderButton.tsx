import React from 'react';
import { Button } from '@rneui/themed'
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';

const OrderButton: React.FC = () => {
    const navigation = useNavigation();

    const handlePress = () => {
        navigation.navigate('Menu');
    };

    return (
        <Button
            title="PRE-ORDER NOW"
            onPress={handlePress}
            buttonStyle={styles.orderbutton}
        />
    );
};

export default OrderButton;