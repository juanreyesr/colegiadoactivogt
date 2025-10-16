import { createClient } from '@supabase/supabase-js';

// This client is used on the client side of the application and only has
// permissions granted by the anonymous key. It should never be used for
// privileged operations such as inserting, updating or deleting data. Those
// operations are performed on the server using the service role key (see
// supabaseAdmin.js).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);