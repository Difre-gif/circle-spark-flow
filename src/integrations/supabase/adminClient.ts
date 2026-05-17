import { supabase } from './client';

// Browser code must never use a service-role client. Super-admin access is now
// enforced by RLS plus guarded RPCs in the database, so the normal user-scoped
// client is the only safe client to expose in the frontend bundle.
export const supabaseAdmin = supabase;
