
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

const AdminRegister = () => {
  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Registration Disabled</CardTitle>
          <CardDescription>Admin registration is currently not available.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">Please contact the system administrator to set up an admin account.</p>
          <Link to="/" className="flex items-center justify-center text-blue-600 hover:underline">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRegister;
