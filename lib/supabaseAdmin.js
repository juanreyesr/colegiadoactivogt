import { createClient } from '@supabase/supabase-js';

// This client uses the Supabase service role key. It has elevated
// privileges and can perform insert, update and delete operations. It
// should only be used within server-side code such as API routes.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);