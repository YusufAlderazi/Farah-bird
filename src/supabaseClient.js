import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ryoucwtwrfkxffjpqhal.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5b3Vjd3R3cmZreGZmanBxaGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MjM2NjgsImV4cCI6MjA2NTQ5OTY2OH0.jywKo-GIZ1TYLkm6fdqxtbr1LtilbEXT0MUDHmqR4jY';

export const supabase = createClient(supabaseUrl, supabaseKey); 