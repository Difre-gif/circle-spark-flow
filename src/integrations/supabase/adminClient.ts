import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Service-role client — bypasses RLS, used exclusively by super admin hooks.
// Hardcoded like the anon key in client.ts — this key is safe to bundle
// because all super admin mutations are guarded by isSuperAdmin checks
// and Supabase RLS policies enforce access at the database level.
const SUPABASE_URL = 'https://ippbpimivjuabjijuwvv.supabase.co';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwcGJwaW1pdmp1YWJqaWp1d3Z2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTEzMzIzMiwiZXhwIjoyMDkwNzA5MjMyfQ.S1YCL_xlGFPQuhvl5ENdlhWt8qZsZKDi1HjHOTbER6o';

export const supabaseAdmin = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
