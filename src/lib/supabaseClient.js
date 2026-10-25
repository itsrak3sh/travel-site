import { createClient } from '@supabase/supabase-js';

const defaultUrl = 'https://rttotmyyomrnpendoayk.supabase.co';
const defaultAnonKey = 'sb_publishable_0Py00VZAGQETGSW8vWXYA_P92v73d8Z';

const rawUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : undefined;
const rawAnonKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : undefined;

export const supabaseUrl = (typeof rawUrl === 'string' && rawUrl.startsWith('http')) ? rawUrl : defaultUrl;
export const supabaseAnonKey = (typeof rawAnonKey === 'string' && rawAnonKey.length > 10) ? rawAnonKey : defaultAnonKey;

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
