import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://ycwldacrvzkooxijtrfi.supabase.co';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_b1Y9f2qug49nWHmuMQBIcQ_FRZg7jvV';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
