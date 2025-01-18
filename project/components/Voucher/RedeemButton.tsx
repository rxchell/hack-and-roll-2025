import React from 'react';
import { Button, Input } from '@rneui/themed'
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';

const RedeemButton: React.FC = () => {
    const navigation = useNavigation();

    const handlePress = () => {
        navigation.navigate('');
    };

    return (
        <Button
            title="Buy / Redeem"
            onPress={handlePress}
            buttonStyle={styles.redeembutton}
        />
    );
};

export default RedeemButton;