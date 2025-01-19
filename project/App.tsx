import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth/Auth'
import Account from './components/Account/Account'
import Menu from './components/Order/Menu'
import Popular from './components/Popular/Popular'
import Leaderboard from './components/Leaderboard/Leaderboard'
import Voucher from './components/Voucher/Voucher'
import { Session } from '@supabase/supabase-js'
import { NavigationContainer, createStaticNavigation, } from '@react-navigation/native';
import { createBottomTabNavigator,  } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Home from './components/Home/Home'
import Order from './components/Order/Order'
import { StripeProvider } from "@stripe/stripe-react-native";
import Stripe from 'stripe'

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Screens for the Tab Navigator
function HomeScreen({ session }: { session: Session }) {
  return <Home session={session} />;
}

function AccountScreen({ session }: { session: Session }) {
  return <Account session={session} />;
}

function MenuScreen({ session }: { session: Session }) {
  return <Menu session={session} />;
}

function VoucherScreen({ session }: { session: Session }) {
  return <Voucher session={session} />;
}

function OrderScreen({ session }: { session: Session }) {
  return <Order session={session} />;
}

function PopularScreen({ session }: { session: Session }) {
  return <Popular session={session} />;
}

function LeaderboardScreen({ session }: { session: Session }) {
  return <Leaderboard session={session} />;
}

// Bottom Tab Navigator
const BottomTabNavigator = ({ session }: { session: Session }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap | undefined;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Account') {
          iconName = focused ? 'person' : 'person-outline';
        } else if (route.name === 'Menu') {
          iconName = focused ? 'fast-food' : 'fast-food-outline';
        } else if (route.name === 'Order') {
          iconName = focused ? 'cart' : 'cart-outline';
        } else if (route.name === 'Voucher') {
          iconName = focused ? 'cash' : 'cash-outline';
        } else if (route.name === 'Leaderboard') {
          iconName = focused ? 'podium' : 'podium-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#ff9e4d',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Home" children={() => <HomeScreen session={session} />} />
    <Tab.Screen name="Menu" children={() => <MenuScreen session={session} />} />
    <Tab.Screen name="Order" children={() => <OrderScreen session={session} />} />
    <Tab.Screen name="Account" children={() => <AccountScreen session={session} />} />
    <Tab.Screen name="Leaderboard" children={() => <LeaderboardScreen session={session} />} />
  </Tab.Navigator>
);

// Root Stack Navigator (handle the flow of screens)
const RootStackNavigator = ({ session }: { session: Session }) => (
  <Stack.Navigator initialRouteName="Tabs">
    <Stack.Screen
      name="Tabs"
      options={{ headerShown: false }}  // Hide header for the bottom tabs screen
    >
      {() => <BottomTabNavigator session={session} />}
    </Stack.Screen>
    {/* Add additional screens here if needed */}
    <Stack.Screen name="Voucher" component={VoucherScreen} />
  </Stack.Navigator>
);

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (!session) {
    return <Auth />;
  }

  return (
    <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}>
      <NavigationContainer>
        <RootStackNavigator session={session} />
      </NavigationContainer>
    </StripeProvider>
  );
}

