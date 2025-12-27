
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://nikjxwevbshtkssopgor.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_TnSY39S9A8szdtda4xU54w_StwQ0RFp";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
