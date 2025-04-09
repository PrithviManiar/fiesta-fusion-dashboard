import { createClient } from '@supabase/supabase-js';

// We'll use the values from the auto-generated client file
const supabaseUrl = "https://hqmftvdhhnfrgddgsrif.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxbWZ0dmRoaG5mcmdkZGdzcmlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NzUzODEsImV4cCI6MjA1OTQ1MTM4MX0.JxbPKAzOBTkokYvFhrOkc-tmk-6U2q0wSeWwKSVeOUk";

// Use these direct values instead of environment variables which seem to be missing
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'student' | 'admin' | 'organizer';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

// User registration function
export const registerUser = async (email: string, password: string, role: UserRole, name: string): Promise<UserProfile | null> => {
  try {
    console.log('Starting registration process...');
    
    // 1. Register user with Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }
    
    if (!authData.user) {
      console.error('User registration failed - no user returned');
      throw new Error('User registration failed');
    }
    
    const userId = authData.user.id;
    console.log('User created with ID:', userId);
    
    // 2. Create profile record in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        { 
          id: userId, 
          name,
          role
        }
      ]);
    
    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Try to clean up the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(userId);
      throw profileError;
    }
    
    console.log('Profile created successfully');
    
    return {
      id: userId,
      email,
      role,
      name
    };
  } catch (error) {
    console.error('Registration error:', error);
    return null;
  }
};

// Helper function to check if a user is authenticated
export const isAuthenticated = async () => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

// Helper function to get current user with profile data
export const getCurrentUser = async (): Promise<UserProfile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  // Get the user's profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (!profile) return null;
  
  return {
    id: user.id,
    email: user.email || '',
    role: profile.role as UserRole,
    name: profile.name
  };
};

// Helper function to register a student for an event
export const registerForEvent = async (eventId: string, studentId: string) => {
  const { data, error } = await supabase
    .from('event_registrations')
    .insert([
      { event_id: eventId, student_id: studentId }
    ]);
  
  if (error) throw error;
  return data;
};

// Helper function to cancel registration for an event
export const cancelEventRegistration = async (eventId: string, studentId: string) => {
  const { data, error } = await supabase
    .from('event_registrations')
    .delete()
    .match({ event_id: eventId, student_id: studentId });
  
  if (error) throw error;
  return data;
};

// Helper function to check if a student is registered for an event
export const isRegisteredForEvent = async (eventId: string, studentId: string) => {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('*')
    .match({ event_id: eventId, student_id: studentId })
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
};

// Helper function to get all events (for student view)
export const getApprovedEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select(`
      id, 
      title, 
      description, 
      date, 
      time, 
      venue_id,
      status,
      created_at,
      venues:venue_id(name, location, capacity)
    `)
    .eq('status', 'approved');
  
  if (error) throw error;
  
  return (data as unknown as EventWithVenue[])?.map(event => ({
    ...event,
    venue_name: event.venues?.name || 'Unknown venue',
    venue_location: event.venues?.location || '',
    venue_capacity: event.venues?.capacity || 0
  })) || [];
};

// Helper function to get pending events (for admin view)
export const getPendingEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select(`
      id, 
      title, 
      description, 
      date, 
      time, 
      venue_id,
      status,
      created_at,
      venues:venue_id(name, location, capacity),
      organizer_id,
      profiles:organizer_id(name, email)
    `)
    .eq('status', 'pending');
  
  if (error) throw error;
  
  return (data as unknown as EventWithVenueAndOrganizer[])?.map(event => ({
    ...event,
    venue_name: event.venues?.name || 'Unknown venue',
    organizer_name: event.profiles?.name || 'Unknown organizer',
    organizer_email: event.profiles?.email || ''
  })) || [];
};
