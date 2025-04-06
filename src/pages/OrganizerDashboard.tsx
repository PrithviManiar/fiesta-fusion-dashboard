
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";

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

interface VenueData {
  name: string;
  location: string;
  capacity: number;
}

const eventFormSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  date: z.string().min(1, {
    message: "Date is required.",
  }),
  time: z.string().min(1, {
    message: "Time is required.",
  }),
  venue_id: z.string().min(1, {
    message: "Venue selection is required.",
  }),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

const OrganizerDashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      venue_id: "",
    },
  });

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
              status,
              created_at,
              venues:venue_id(name)
            `)
            .eq('organizer_id', user.id);

          if (eventsError) throw eventsError;

          const formattedEvents = eventsData?.map(event => ({
            ...event,
            venue_name: event.venues?.name || 'Unknown venue',
            status: event.status || 'pending',
            created_at: event.created_at || new Date().toISOString()
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

  const onSubmit = async (values: EventFormValues) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to create events."
      });
      return;
    }

    try {
      // First get the venue name
      const venue = venues.find(v => v.id === values.venue_id);
      
      // Insert event data
      const { data, error } = await supabase
        .from('events')
        .insert([
          {
            title: values.title,
            description: values.description,
            date: values.date,
            time: values.time,
            venue_id: values.venue_id,
            organizer_id: user.id,
            status: 'pending'
          }
        ])
        .select();

      if (error) throw error;

      // Update local state with new event
      if (data && data[0]) {
        const newEvent = {
          ...data[0],
          venue_name: venue?.name || 'Unknown venue'
        };
        setEvents(prev => [newEvent, ...prev]);
      }

      toast({
        title: "Event created",
        description: "Your event has been created and is pending approval."
      });

      // Reset form and close dialog
      form.reset();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating event:', error.message);
      toast({
        variant: "destructive",
        title: "Failed to create event",
        description: error.message || "There was an error creating your event."
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
        <Button variant="outline" onClick={() => supabase.auth.signOut()}>Logout</Button>
      </div>

      <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Create New Event
              <Plus className="text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">Create Event</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new campus event. Your event will require admin approval.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter event title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter event description" 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="venue_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Venue</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a venue" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {venues.map((venue) => (
                                <SelectItem key={venue.id} value={venue.id}>
                                  {venue.name} ({venue.location}, Capacity: {venue.capacity})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit">Submit Event</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              My Events
              <Calendar className="text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading events...</span>
              </div>
            ) : events.length > 0 ? (
              <div className="space-y-4">
                {events.map(event => (
                  <Card key={event.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle>{event.title}</CardTitle>
                        <span className={`font-semibold capitalize ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                      <CardDescription>
                        Date: {new Date(event.date).toLocaleDateString()} at {event.time}
                      </CardDescription>
                      <CardDescription>
                        Venue: {event.venue_name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>{event.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No events created yet. Use the "Create Event" button to get started.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
