import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Add validation for production
if (typeof window !== 'undefined' && (!supabaseUrl.includes('placeholder') && !supabaseKey.includes('placeholder'))) {
  console.log('✅ Supabase client initialized successfully');
} else if (typeof window !== 'undefined') {
  console.warn('⚠️ Supabase environment variables not configured - using placeholders');
}

export const supabase = createClient(supabaseUrl, supabaseKey);