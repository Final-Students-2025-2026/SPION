import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cihxwshoupuvpxhlbgat.supabase.co'
const supabaseKey = 'sb_publishable_eKoszEVWiLylbazs-aJfFQ_-mCqGDEv'

export const supabase = createClient(
supabaseUrl,
supabaseKey
)