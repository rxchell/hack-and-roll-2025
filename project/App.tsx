import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth/Auth'
import Account from './components/Account/Account'
import Menu from './components/Order/Menu'
//import Voucher from './components/Voucher/Voucher'
import Popular from './components/Popular/Popular'
import Leaderboard from './components/Leaderboard/Leaderboard'
//import { View } from 'react-native'
import Voucher from './components/Voucher/Voucher'
//import { View } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Home from './components/Home/Home'
import Order from './components/Order/Order'

const Tab = createBottomTabNavigator();

function HomeScreen({ session }: { session: Session }) {
  return <Home session={session} />;
}

function AccountScreen({ session }: { session: Session }) {
  return <Account session={session} />;
}

function MenuScreen({ session }: { session: Session }) {
  return <Menu session={session} />;
}

function VoucherScreen({ session }: { session: Session}) {
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

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])
  if (!session) {
    return <Auth />;
  }
  return (
        <NavigationContainer>
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
                } else if (route.name === 'Popular') {
                  iconName = focused ? 'alert' : 'alert-outline';
                } else if (route.name === 'Leaderboard') {
                  iconName = focused ? 'podium' : 'podium-outline';
                } else if (route.name === 'Voucher') {
                  iconName = focused ? 'cash' : 'cash-outline';
                }
                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#ff9e4d',
              tabBarInactiveTintColor: 'gray',
            })}
          >
            <Tab.Screen name="Home" children={() => <HomeScreen session={session} />} />
            <Tab.Screen name="Order" children={() => <OrderScreen session={session} />} />
            <Tab.Screen name="Account" children={() => <AccountScreen session={session} />} />
            <Tab.Screen name="Menu" children={() => <MenuScreen session={session} />} />
            <Tab.Screen name="Voucher" children={() => <VoucherScreen session={session} />} />
            <Tab.Screen name="Leaderboard" children={() => <LeaderboardScreen session={session} />} />
          </Tab.Navigator>
        </NavigationContainer>
  )
}