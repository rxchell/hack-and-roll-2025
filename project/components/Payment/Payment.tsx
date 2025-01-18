import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { View } from 'react-native';
import CashButton from './CashButton';
import CardButton from './CardButton';
import { styles } from './styles';


export default function Payment({ session }: { session: Session }) {
    return (
        <View style = {styles.paymentscreen}>
            <CashButton />
            <CardButton />
        </View>
    )}
