
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
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
  );
};

export default EventCard;
