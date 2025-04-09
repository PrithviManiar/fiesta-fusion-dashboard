
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, UserProfile, UserRole, registerUser } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  register: (email: string, password: string, role: UserRole, name: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Initial session check
    const checkUser = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Fetch user profile
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (data) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: data.role as UserRole,
            name: data.name
          });
        }
      }
      
      setLoading(false);
    };

    checkUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Fetch user profile
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (data) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              role: data.role as UserRole,
              name: data.name
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          navigate('/');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const register = async (email: string, password: string, role: UserRole, name: string): Promise<boolean> => {
    try {
      // Prevent admin registration
      if (role === 'admin') {
        throw new Error('Admin registration is not allowed.');
      }

      setLoading(true);
      const user = await registerUser(email, password, role, name);
      
      if (!user) {
        throw new Error('Registration failed. Please try again.');
      }
      
      // For organizer, set initial approval status to 'pending'
      if (role === 'organizer') {
        const { error } = await supabase
          .from('profiles')
          .update({ approval_status: 'pending' })
          .eq('id', user.id);

        if (error) throw error;

        toast({
          title: "Registration pending",
          description: "Your organizer account is pending admin approval.",
        });
      } else {
        toast({
          title: "Registration successful",
          description: `Your account has been created. You can now login.`,
        });
      }
      
      // Navigate to the appropriate login page
      navigate(`/login/${role}`);
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "An error occurred during registration.",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string, role: UserRole) => {
    try {
      setLoading(true);

      // Hardcoded admin credentials check
      if (role === 'admin' && 
          email !== 'harshit1chandra3@gmail.com' && 
          password !== 'harshit.prj') {
        throw new Error('Invalid admin credentials');
      }

      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }

      // Additional check for organizers - must be approved
      if (role === 'organizer') {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('approval_status')
          .eq('id', data.user?.id)
          .single();

        if (profileError) throw profileError;

        if (profileData?.approval_status !== 'approved') {
          await supabase.auth.signOut();
          throw new Error('Your account is not yet approved. Please contact an administrator.');
        }
      }
      
      // Navigate to the appropriate dashboard based on user role
      navigate(`/dashboard/${role}`);
      toast({
        title: "Login successful",
        description: `Welcome to your ${role} dashboard!`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "An error occurred during login.",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      navigate('/');
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error.message || "An error occurred while signing out.",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
