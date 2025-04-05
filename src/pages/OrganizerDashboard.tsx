
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from 'lucide-react';

const OrganizerDashboard = () => {
  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Organizer Dashboard</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Event</CardTitle>
            <Plus className="text-primary" />
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              Create Event
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My Events</CardTitle>
            <Calendar className="text-primary" />
          </CardHeader>
          <CardContent>
            <p>No events created yet</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
