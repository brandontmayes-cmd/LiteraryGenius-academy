// App.tsx - Main Application Routing with Admin Support
// Replace your current App.tsx with this

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout'; // Landing page
import { StudentView } from '@/components/StudentView';
import { AdminDashboard } from '@/components/AdminDashboard';

function App() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Check if user is admin when they log in
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      try {
        // Check profiles table for admin flag
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin, role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(profile?.is_admin === true || profile?.role === 'admin');
          console.log('Admin status:', profile?.is_admin, 'Role:', profile?.role);
        }
      } catch (error) {
        console.error('Unexpected error checking admin:', error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Show loading while checking auth or admin status
  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2744] to-[#2d3e5f]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#ffd700] border-solid mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show landing page
  if (!user) {
    return <AppLayout />;
  }

  // Logged in as admin - show admin dashboard
  if (isAdmin) {
    console.log('🔑 Admin user detected - showing AdminDashboard');
    return <AdminDashboard onLogout={async () => {
      await supabase.auth.signOut();
      window.location.reload();
    }} />;
  }

  // Logged in as student - show student view
  console.log('👤 Regular user detected - showing StudentView');
  return <StudentView />;
}

export default App;
