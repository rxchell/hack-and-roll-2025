import React from 'react';
import { Button, Input } from '@rneui/themed'
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';

const VoucherButton = ({orderId}: {orderId: string}) => {
    const navigation = useNavigation();

    const handlePress = () => {
        console.log("kirby")
        console.log(orderId)

        // orderID gets lost here :(
        navigation.navigate('Voucher', { orderId });
    };

    return (
        <Button
            title="Buy / Redeem Voucher"
            onPress={handlePress}
            buttonStyle={styles.redeembutton}
        />
    );
};

export default VoucherButton;