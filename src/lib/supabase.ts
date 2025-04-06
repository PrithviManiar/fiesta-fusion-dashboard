
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing from environment variables.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

export type UserRole = 'student' | 'admin' | 'organizer';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

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
      venues(name, location, capacity)
    `)
    .eq('status', 'approved');
  
  if (error) throw error;
  
  return data?.map(event => ({
    ...event,
    venue_name: event.venues ? event.venues.name : 'Unknown venue',
    venue_location: event.venues ? event.venues.location : '',
    venue_capacity: event.venues ? event.venues.capacity : 0
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
      venues(name, location, capacity),
      organizer_id,
      profiles(name, email)
    `)
    .eq('status', 'pending');
  
  if (error) throw error;
  
  return data?.map(event => ({
    ...event,
    venue_name: event.venues ? event.venues.name : 'Unknown venue',
    organizer_name: event.profiles ? event.profiles.name : 'Unknown organizer',
    organizer_email: event.profiles ? event.profiles.email : ''
  })) || [];
};
