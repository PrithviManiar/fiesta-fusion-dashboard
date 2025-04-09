
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, XCircle, LogOut, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserProfile } from '@/lib/supabase';

interface PendingOrganizer extends UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'organizer';
}

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [pendingOrganizers, setPendingOrganizers] = useState<PendingOrganizer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingOrganizers();
  }, []);

  const fetchPendingOrganizers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'organizer')
        .eq('approval_status', 'pending');
      
      if (error) {
        throw error;
      }
      
      setPendingOrganizers(data as PendingOrganizer[]);
    } catch (error) {
      console.error('Error fetching pending organizers:', error);
      toast({
        variant: "destructive",
        title: "Failed to load organizer requests",
        description: "There was an error loading organizer approval requests.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ approval_status: status })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setPendingOrganizers(pendingOrganizers.filter(organizer => organizer.id !== id));
      
      toast({
        title: `Organizer ${status}`,
        description: `You have ${status} the organizer account.`,
      });
    } catch (error) {
      console.error(`Error ${status} organizer:`, error);
      toast({
        variant: "destructive",
        title: "Action failed",
        description: `There was an error ${status === 'approved' ? 'approving' : 'rejecting'} the organizer.`,
      });
    }
  };

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
      
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Pending Organizer Approvals</h2>
        {loading ? (
          <p>Loading approval requests...</p>
        ) : pendingOrganizers.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">No pending organizer approval requests</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingOrganizers.map((organizer) => (
                    <TableRow key={organizer.id}>
                      <TableCell>{organizer.name || 'N/A'}</TableCell>
                      <TableCell>{organizer.email}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={() => handleApproval(organizer.id, 'approved')}
                          >
                            <UserCheck size={16} />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="flex items-center gap-1"
                            onClick={() => handleApproval(organizer.id, 'rejected')}
                          >
                            <UserX size={16} />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
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
