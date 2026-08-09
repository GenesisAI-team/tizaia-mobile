import 'react-native-url-polyfill/auto';
import 'expo-sqlite/localStorage/install';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { getAppConfig } from '../config/env';

export function createSupabaseClient(): SupabaseClient {
  const config = getAppConfig();
  return createClient(config.supabaseUrl, config.supabasePublishableKey, {
    auth: {
      storage: localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}
