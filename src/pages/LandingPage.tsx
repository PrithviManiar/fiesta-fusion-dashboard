
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { User, Users, UserCog } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const UserTypeCard = ({ 
    title, 
    icon: Icon, 
    description, 
    loginPath 
  }: { 
    title: string, 
    icon: React.ElementType, 
    description: string, 
    loginPath: string 
  }) => (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
      <CardHeader className="items-center">
        <Icon size={48} className="text-primary mb-4" />
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">{description}</p>
        <Button 
          onClick={() => navigate(loginPath)} 
          className="w-full"
        >
          Login as {title}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-primary">
          Campus Event Management System
        </h1>
        <div className="grid md:grid-cols-3 gap-8">
          <UserTypeCard 
            title="Student" 
            icon={User}
            description="Register for events and view upcoming activities"
            loginPath="/login/student"
          />
          <UserTypeCard 
            title="Organizer" 
            icon={Users}
            description="Create and manage campus events"
            loginPath="/login/organizer"
          />
          <UserTypeCard 
            title="Admin" 
            icon={UserCog}
            description="Manage venues and event approvals"
            loginPath="/login/admin"
          />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

