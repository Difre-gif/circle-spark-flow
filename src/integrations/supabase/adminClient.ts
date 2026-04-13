import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Service-role client — bypasses RLS, used exclusively by super admin hooks.
// Never expose this key to regular users. Only import this file in super-admin
// hooks that are guarded by isSuperAdmin checks.
const SUPABASE_URL = 'https://ippbpimivjuabjijuwvv.supabase.co';
const SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string;

export const supabaseAdmin = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
