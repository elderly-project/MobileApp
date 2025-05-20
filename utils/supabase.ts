import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get the Supabase URL and anon key from environment variables or hardcode (not ideal for production)
const supabaseUrl = 'https://dhlpxwbdkzmlalfniipk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobHB4d2Jka3ptbGFsZm5paXBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMjI2MDIsImV4cCI6MjA1NjU5ODYwMn0.y0Z_XHXTDHaGwZlwCSGUhWtHNf54WpJ1hRgFzPKqBVI';

// Create a Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: AsyncStorage,
  },
});

// Function to get the current user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Exception getting user:', error);
    return null;
  }
};

// Function to get user profile data
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception getting user profile:', error);
    return null;
  }
};

// Function to get user medications
export const getUserMedications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('medications')
      .select('*, documents(*)')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error getting medications:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Exception getting medications:', error);
    return [];
  }
};

// Function to get user appointments
export const getUserAppointments = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .order('appointment_date', { ascending: true });
    
    if (error) {
      console.error('Error getting appointments:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Exception getting appointments:', error);
    return [];
  }
}; 