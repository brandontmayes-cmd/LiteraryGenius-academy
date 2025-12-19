// App.tsx - NUCLEAR OPTION - COMPLETE FRESH START
// This file IGNORES all other routing and does EVERYTHING itself

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// Import ONLY the components we need
import AppLayout from '@/components/AppLayout';
import { StudentView } from '@/components/StudentView';
import { AdminDashboard } from '@/components/AdminDashboard';

function App() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [currentView, setCurrentView] = useState<'landing' | 'admin' | 'student'>('landing');

  // FORCE CHECK ADMIN STATUS
  useEffect(() => {
    const forceCheckAdmin = async () => {
      console.log('🔍 FORCE CHECK - User:', user?.email);
      
      if (!user) {
        console.log('❌ No user - showing landing page');
        setIsAdmin(false);
        setCheckingAdmin(false);
        setCurrentView('landing');
        return;
      }

      setCheckingAdmin(true);
      
      try {
        console.log('📊 Checking profiles table for user:', user.id);
        
        // FORCE check profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin, role, email')
          .eq('id', user.id)
          .single();

        console.log('📋 Profile result:', profile);
        console.log('❌ Profile error:', error);

        if (error) {
          console.error('⚠️ Error fetching profile:', error);
          // Default to student if error
          setIsAdmin(false);
          setCurrentView('student');
          setCheckingAdmin(false);
          return;
        }

        // Check admin status
        const adminStatus = profile?.is_admin === true || profile?.role === 'admin';
        console.log('🔑 Admin status:', adminStatus);
        
        setIsAdmin(adminStatus);
        setCurrentView(adminStatus ? 'admin' : 'student');
        
      } catch (error) {
        console.error('💥 Unexpected error:', error);
        setIsAdmin(false);
        setCurrentView('student');
      } finally {
        setCheckingAdmin(false);
        console.log('✅ Admin check complete');
      }
    };

    forceCheckAdmin();
  }, [user]);

  // FORCE LOG CURRENT STATE
  useEffect(() => {
    console.log('🎯 Current State:', {
      user: user?.email,
      isAdmin,
      currentView,
      authLoading,
      checkingAdmin
    });
  }, [user, isAdmin, currentView, authLoading, checkingAdmin]);

  // Loading screen
  if (authLoading || checkingAdmin) {
    console.log('⏳ Loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2744] to-[#2d3e5f]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#ffd700] border-solid mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading Literary Genius Academy...</p>
        </div>
      </div>
    );
  }

  // FORCE RENDER BASED ON STATE
  console.log('🎨 Rendering view:', currentView);

  // Landing page (not logged in)
  if (currentView === 'landing' || !user) {
    console.log('🏠 Showing landing page');
    return <AppLayout />;
  }

  // Admin view
  if (currentView === 'admin') {
    console.log('👑 Showing ADMIN dashboard');
    return (
      <AdminDashboard 
        onLogout={async () => {
          console.log('🚪 Logging out...');
          await supabase.auth.signOut();
          setCurrentView('landing');
          setIsAdmin(false);
          window.location.reload();
        }} 
      />
    );
  }

  // Student view (default)
  console.log('👤 Showing STUDENT view');
  return <StudentView />;
}

export default App;
