import React from 'react';
import { Button } from '@rneui/themed'
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';

const ConfirmOrderButton: React.FC = () => {
    const navigation = useNavigation();

    const handlePress = () => {
        navigation.navigate('Purchase');
    };

    return (
        <Button
            title="Proceed to payment"
            onPress={handlePress}
            buttonStyle={styles.confirmButton}
        />
    );
};

export default ConfirmOrderButton;