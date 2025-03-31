
import { supabase } from '@/lib/supabase/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates required tables in Supabase if they don't exist
 * This is a temporary utility that will be removed after migration
 */
export const createRequiredTables = async () => {
  try {
    // Check for admin_actions table
    const { error: checkError } = await supabase
      .from('admin_actions')
      .select('id')
      .limit(1);
      
    // If there's an error like relation does not exist, create the table
    if (checkError && checkError.message.includes('does not exist')) {
      console.log('Creating admin_actions table...');
      
      // Create the table via REST API
      const { error } = await supabase.rpc('create_admin_tables');
      
      if (error) {
        console.error('Error creating tables:', error);
      } else {
        console.log('Tables created successfully');
      }
    } else {
      console.log('Required tables already exist');
    }
  } catch (error) {
    console.error('Error in migration utility:', error);
  }
};

/**
 * Ensure the admin tables exist
 */
export const ensureAdminTables = async () => {
  try {
    // Check for admin profile
    const { data: adminExists, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_admin', true)
      .limit(1);
      
    if (error) {
      console.error('Error checking for admin profile:', error);
    }
    
    // If no admin exists, create one
    if (!adminExists || adminExists.length === 0) {
      console.log('Creating admin profile...');
      
      await supabase
        .from('profiles')
        .insert({
          id: uuidv4(),
          nickname: 'Admin',
          display_name: 'Admin User',
          is_admin: true,
          gender: 'other',
          country: 'US',
          interests: ['Administration'],
          age: 30
        });
        
      console.log('Admin profile created');
    }
  } catch (error) {
    console.error('Error ensuring admin tables:', error);
  }
};
