
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://omqttgjjuhzlkwfujgok.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tcXR0Z2pqdWh6bGt3ZnVqZ29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MDQ1MzAsImV4cCI6MjA4NjM4MDUzMH0.RK498kV5qMgzdJlVW6NXgRRUDd0w6IG9FZgazVuA188';

export const supabase = createClient(supabaseUrl, supabaseKey);
