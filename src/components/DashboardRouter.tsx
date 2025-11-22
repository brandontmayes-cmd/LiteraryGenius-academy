// File: src/components/DashboardRouter.tsx
// FIXED VERSION - Properly redirects after login

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const DashboardRouter = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const redirectToDashboard = async () => {
      if (!user) {
        // Not logged in - redirect to home
        navigate('/', { replace: true });
        return;
      }

      try {
        // Get user's role from profile
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          navigate('/', { replace: true });
          return;
        }

        // Redirect based on role
        const role = profile?.role?.toLowerCase();
        
        switch (role) {
          case 'student':
            navigate('/student-dashboard', { replace: true });
            break;
          case 'teacher':
            navigate('/teacher-dashboard', { replace: true });
            break;
          case 'parent':
            navigate('/parent-dashboard', { replace: true });
            break;
          default:
            // Default to student dashboard if role is unclear
            navigate('/student-dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Error in dashboard router:', error);
        navigate('/', { replace: true });
      }
    };

    redirectToDashboard();
  }, [user, navigate]);

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );
};
