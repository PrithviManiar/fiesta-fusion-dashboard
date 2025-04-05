
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import CreateEventCard from '@/components/organizer/CreateEventCard';
import EventsList from '@/components/organizer/EventsList';
import EventFormDialog from '@/components/organizer/EventFormDialog';

interface Venue {
  id: string;
  name: string;
  capacity: number;
  location: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue_id: string;
  venue_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const OrganizerDashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch organizer's events
        if (user) {
          const { data: eventsData, error: eventsError } = await supabase
            .from('events')
            .select(`
              id, 
              title, 
              description, 
              date, 
              time, 
              venue_id,
              venues(name),
              status,
              created_at
            `)
            .eq('organizer_id', user.id);

          if (eventsError) throw eventsError;

          const formattedEvents = eventsData?.map(event => ({
            ...event,
            venue_name: event.venues?.name || 'Unknown venue'
          })) || [];

          setEvents(formattedEvents);
        }

        // Fetch venues
        const { data: venuesData, error: venuesError } = await supabase
          .from('venues')
          .select('*');

        if (venuesError) throw venuesError;
        setVenues(venuesData || []);
      } catch (error: any) {
        console.error('Error fetching data:', error.message);
        toast({
          variant: "destructive",
          title: "Failed to load data",
          description: "There was an error loading your events and venues.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const handleEventCreated = (newEvent: Event) => {
    setEvents(prev => [newEvent, ...prev]);
  };

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
        <Button variant="outline" onClick={() => supabase.auth.signOut()}>Logout</Button>
      </div>

      <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <CreateEventCard onCreateClick={() => setIsDialogOpen(true)} />
          
          <EventFormDialog 
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            venues={venues}
            onEventCreated={handleEventCreated}
            userId={user?.id || ''}
          />
        </div>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              My Events
              <Calendar className="text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EventsList events={events} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
