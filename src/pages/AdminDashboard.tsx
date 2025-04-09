
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, XCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "An error occurred during logout. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-teal-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Logout
        </Button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Venue Availability</CardTitle>
            <Calendar className="text-primary" />
          </CardHeader>
          <CardContent>
            <p>Check venue availability for specific dates</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Event Requests</CardTitle>
            <CheckCircle className="text-green-500" />
          </CardHeader>
          <CardContent>
            <p>No pending event requests</p>
            <Button className="mt-4">Review Requests</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Declined Events</CardTitle>
            <XCircle className="text-red-500" />
          </CardHeader>
          <CardContent>
            <p>No recently declined events</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
