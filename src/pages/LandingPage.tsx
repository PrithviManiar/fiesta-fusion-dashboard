
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
    loginPath,
    registerPath 
  }: { 
    title: string, 
    icon: React.ElementType, 
    description: string, 
    loginPath: string,
    registerPath: string
  }) => (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
      <CardHeader className="items-center">
        <Icon size={48} className="text-primary mb-4" />
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">{description}</p>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={() => navigate(registerPath)} 
            className="w-full"
            variant="outline"
          >
            Register
          </Button>
          <Button 
            onClick={() => navigate(loginPath)} 
            className="w-full"
          >
            Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-primary">
          Campus Event Management System
        </h1>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <UserTypeCard 
            title="Student" 
            icon={User}
            description="Register for events and view upcoming activities"
            loginPath="/login/student"
            registerPath="/register/student"
          />
          <UserTypeCard 
            title="Organizer" 
            icon={Users}
            description="Create and manage campus events"
            loginPath="/login/organizer"
            registerPath="/register/organizer"
          />
          <UserTypeCard 
            title="Admin" 
            icon={UserCog}
            description="Manage the entire system and approve events"
            loginPath="/login/admin"
            registerPath="/register/admin"
          />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
