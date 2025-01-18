import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://jcccjsgpxupodjnpbrko.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjY2Nqc2dweHVwb2RqbnBicmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4OTI2MDYsImV4cCI6MjA1MTQ2ODYwNn0.YEwK-UAJrkVhNRNl4nC0ACyo-ST2eFVVuCCprji6nL4"

//const supabaseUrl = process.env.SUPABASE_URL;
//const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})