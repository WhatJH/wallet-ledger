import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const getUserId = () => {
  let userId = localStorage.getItem('guest_user_id');
  if (!userId) {
    userId = crypto.randomUUID(); 
    localStorage.setItem('guest_user_id', userId);
  }
  return userId;
}