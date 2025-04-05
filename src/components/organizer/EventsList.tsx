
import React from 'react';
import { Loader2 } from 'lucide-react';
import EventCard from './EventCard';

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

interface EventsListProps {
  events: Event[];
  loading: boolean;
}

const EventsList = ({ events, loading }: EventsListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading events...</span>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <p className="text-center py-8 text-muted-foreground">
        No events created yet. Use the "Create Event" button to get started.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

export default EventsList;
