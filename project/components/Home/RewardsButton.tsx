import React from 'react';
import { Button } from '@rneui/themed'
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';

const RewardsButton: React.FC = () => {
    const navigation = useNavigation();

    const handlePress = () => {
        navigation.navigate('Voucher');
    };

    return (
        <Button
            title="View rewards"
            onPress={handlePress}
            buttonStyle={styles.rewardsbutton}
        />
    );
};

export default RewardsButton;