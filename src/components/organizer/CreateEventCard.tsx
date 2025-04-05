
import React from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CreateEventCardProps {
  onCreateClick: () => void;
}

const CreateEventCard = ({ onCreateClick }: CreateEventCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Create New Event
          <Plus className="text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button className="w-full" onClick={onCreateClick}>Create Event</Button>
      </CardContent>
    </Card>
  );
};

export default CreateEventCard;
