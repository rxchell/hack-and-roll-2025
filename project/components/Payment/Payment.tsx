import React, { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { ReactNativeModal } from "react-native-modal";
import { Button } from "@rneui/themed";
import { styles } from "./styles";
import { fetchAPI } from "../../lib/fetch";
import { router } from "expo-router";

const Payment = ({ fullName, email, amount }: PaymentProps) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [success, setSuccess] = useState<boolean>(false);

  // const confirmHandler = async (
  //   paymentMethod,
  //   shouldSavePaymentMethod,
  //   intentCreationCallback
  // ) => {
  //   try {
  //     const response = await fetch(`${API_URL}/create-intent`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         amount: 1099, // Match the amount configured in initPaymentSheet
  //         currency: "SGD",
  //         paymentMethodId: paymentMethod.id,
  //         savePaymentMethod: shouldSavePaymentMethod,
  //       }),
  //     });
  
  //     const { client_secret, error } = await response.json();
  
  //     if (client_secret) {
  //       console.log("Client secret received:", client_secret);
  //       intentCreationCallback({ clientSecret: client_secret });
  //     } else {
  //       console.error("Error in creating payment intent:", error);
  //       intentCreationCallback({ error });
  //     }
  //   } catch (err) {
  //     console.error("Error in confirmHandler:", err);
  //     if (err instanceof Error) {
  //       intentCreationCallback({ error: { message: err.message } });
  //     } else {
  //       intentCreationCallback({ error: { message: String(err) } });
  //     }
  //   }
  // };
  
  const initializePaymentSheet = async () => {
    try {
      console.log("Fetching payment intent data...");
      const response = await fetchAPI("/(api)/(stripe)/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          email,
          amount: parseInt(amount) * 100, // Convert to cents
        }),
      });
  
      console.log("Payment intent data:", response);
  
      const { paymentIntentClientSecret, ephemeralKeySecret, customerId } = response;
  
      if (!paymentIntentClientSecret || !ephemeralKeySecret || !customerId) {
        throw new Error("Failed to create PaymentIntent, missing required data.");
      }
  
      const { error } = await initPaymentSheet({
        paymentIntentClientSecret,
        merchantDisplayName: "brospot",
        customerId, // Include the customer ID for consistency
        customerEphemeralKeySecret: ephemeralKeySecret, // Send ephemeral key secret
      });
  
      if (error) {
        console.error("Error initializing payment sheet:", error);
        throw new Error(`Payment sheet initialization failed: ${error.message}`);
      }
  
      return true;
    } catch (error) {
      console.error("Error setting up payment sheet:", error);
      Alert.alert("Error", `Failed to initialize payment sheet: ${error.message}`);
      return false;
    }
  };
  

  // const initializePaymentSheet = async () => {
  //   try {
  //     const response = await fetch(`${API_URL}/create-intent`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });
  
  //     const { client_secret, error } = await response.json();
  
  //     if (error) {
  //       console.error("Error fetching Payment Intent:", error);
  //       Alert.alert("Error", "Failed to fetch Payment Intent.");
  //       return false;
  //     }
  
  //     const { error: initError } = await initPaymentSheet({
  //       paymentIntentClientSecret: client_secret,
  //       merchantDisplayName: "Example, Inc.",
  //     });
  
  //     if (initError) {
  //       console.error("Error initializing PaymentSheet:", initError);
  //       Alert.alert("Error", "Failed to initialize the payment sheet.");
  //       return false;
  //     }
  
  //     console.log("PaymentSheet initialized successfully.");
  //     return true;
  //   } catch (err) {
  //     console.error("Unexpected error during initialization:", err);
  //     Alert.alert("Error", "Unexpected error during initialization.");
  //     return false;
  //   }
  // };  
  
  //   const params = await fetchPaymentSheetParams();

  //   if (params) {
  //     const { paymentIntent, ephemeralKey, customer } = params;

  //     const { error } = await initPaymentSheet({
  //       merchantDisplayName: "Example, Inc.",
  //       paymentIntentClientSecret: paymentIntent.client_secret,
  //       customerId: customer,
  //       customerEphemeralKeySecret: ephemeralKey.secret,
  //       defaultBillingDetails: {
  //         name: fullName || email.split("@")[0],
  //         email,
  //       },
  //     });

  //     if (!error) {
  //       return true;
  //     } else {
  //       Alert.alert("Error", "Failed to initialize the payment sheet.");
  //       return false;
  //     }
  //   }

  //   return false;
  // };

  const openPaymentSheet = async () => {
      const isInitialized = await initializePaymentSheet();

      if (!isInitialized) {
        Alert.alert("Error", "Failed to initialize payment sheet. Try again.");
        return;
      }

      const { error } = await presentPaymentSheet();

      if (error) {
        Alert.alert(`Error code: ${error.code}`, error.message);
      } else {
        setSuccess(true);
      }
    };

  return (
    <>
      <Button
        title="Purchase"
        onPress={openPaymentSheet}
        buttonStyle={styles.confirmButton}
      />

      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View>
          <Text>Order placed successfully</Text>
          <Text>
            Thank you for your order. Your order has been successfully placed.
          </Text>
          <Button
            title="Back Home"
            onPress={() => {
              router.push("/(root)/(tabs)/home");
            }}
            buttonStyle={styles.confirmButton}
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

export default Payment;
