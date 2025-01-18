import React from 'react';
import { Button } from '@rneui/themed'
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';

const CashButton: React.FC = () => {
    const navigation = useNavigation();

    const handlePress = () => {
    };

    return (
        <Button
            title="Cash"
            onPress={handlePress}
            buttonStyle={styles.rewardsbutton}
        />
    );
};

export default CashButton;