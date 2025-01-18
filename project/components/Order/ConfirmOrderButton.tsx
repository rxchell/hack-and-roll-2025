import React from 'react';
import { Button } from '@rneui/themed'
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';

import { StripeProvider } from '@stripe/stripe-react-native';

const ConfirmOrderButton: React.FC = () => {
    const handlePress = () => {
    };

    return (
        <StripeProvider 
            publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
            merchantIdentifier='merchant.brospot.com'
            urlScheme="brospot"
        >
        <Button
            title="Proceed to payment"
            onPress={handlePress}
            buttonStyle={styles.confirmButton}
        />
        </StripeProvider>
    );
};

export default ConfirmOrderButton;