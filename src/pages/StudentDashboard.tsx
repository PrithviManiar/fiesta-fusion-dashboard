
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const StudentDashboard = () => {
  return (
    <div className="min-h-screen bg-orange-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Student Dashboard</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No upcoming events registered.</p>
            <Button className="mt-4">Browse Events</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Event Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Select an event to register.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
