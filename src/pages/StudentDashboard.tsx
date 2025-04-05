
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  status: string;
}

const StudentDashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch approved events
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'approved');

        if (error) {
          throw error;
        }

        setEvents(data || []);
      } catch (error: any) {
        console.error('Error fetching events:', error.message);
        toast({
          variant: "destructive",
          title: "Failed to load events",
          description: "There was an error loading events. Please try again later."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [toast]);

  const registerForEvent = async (eventId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to register for events."
      });
      return;
    }

    setRegistering(eventId);
    
    try {
      // Check if user is already registered
      const { data: existingReg, error: checkError } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw checkError;
      }

      if (existingReg) {
        toast({
          title: "Already registered",
          description: "You are already registered for this event."
        });
        return;
      }

      // Register for the event
      const { error } = await supabase
        .from('event_registrations')
        .insert([
          { event_id: eventId, user_id: user.id }
        ]);

      if (error) {
        throw error;
      }

      toast({
        title: "Registration successful",
        description: "You have successfully registered for the event!"
      });
    } catch (error: any) {
      console.error('Error registering for event:', error.message);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "There was an error registering for the event."
      });
    } finally {
      setRegistering(null);
    }
  };

  const EventCard = ({ event }: { event: Event }) => (
    <Card>
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        <CardDescription>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {new Date(event.date).toLocaleDateString()} at {event.time}
          </div>
          <div>Venue: {event.venue}</div>
          <div>Organizer: {event.organizer}</div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{event.description}</p>
        <Button 
          className="w-full" 
          onClick={() => registerForEvent(event.id)}
          disabled={registering === event.id}
        >
          {registering === event.id ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering...
            </>
          ) : (
            'Register for Event'
          )}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-orange-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <Button variant="outline" onClick={() => supabase.auth.signOut()}>Logout</Button>
      </div>
      
      <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading events...</span>
        </div>
      ) : events.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No upcoming events available.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentDashboard;
