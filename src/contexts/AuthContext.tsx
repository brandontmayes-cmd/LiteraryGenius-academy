import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthState, LoginCredentials, RegisterData } from '../types/auth';
import { supabase } from '../lib/supabase';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  trackSession: (deviceInfo: any) => Promise<void>;
  pendingVerification: boolean;
}




const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        isLoading: false, 
        isAuthenticated: true, 
        user: action.payload,
        error: null 
      };
    case 'LOGIN_ERROR':
      return { 
        ...state, 
        isLoading: false, 
        isAuthenticated: false, 
        user: null,
        error: action.payload 
      };
    case 'LOGOUT':
      return { 
        ...state, 
        isAuthenticated: false, 
        user: null, 
        error: null 
      };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [pendingEmail, setPendingEmail] = React.useState<string | null>(null);


  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        dispatch({ type: 'LOGIN_ERROR', payload: '' });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Profile doesn't exist yet - create it for OAuth users
        if (error.code === 'PGRST116') {
          await createOAuthProfile(userId);
          return;
        }
        throw error;
      }

      if (data) {
        const user: User = {
          id: data.id,
          email: data.email,
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          role: data.role,
          avatar: data.avatar_url,
          createdAt: data.created_at,
          lastLogin: data.last_login,
          isActive: data.is_active,
        };
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      }
    } catch (error: any) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message });
    }
  };


  const createOAuthProfile = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          email: user.email || '',
          first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
          last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          role: 'student',
          is_active: true,
          email_verified: true,
          avatar_url: user.user_metadata?.avatar_url || null,
        });

      if (error) throw error;
      await fetchUserProfile(userId);
    } catch (error: any) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message });
    }
  };



  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
    } catch (error: any) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message || 'Invalid credentials' });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Check if email confirmation is required
        if (authData.user.identities && authData.user.identities.length === 0) {
          // Email already exists
          throw new Error('An account with this email already exists');
        }

        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email: data.email,
            first_name: data.firstName,
            last_name: data.lastName,
            role: data.role,
            is_active: true,
            email_verified: false,
            verification_sent_at: new Date().toISOString(),
          });

        if (profileError) throw profileError;

        // Set pending verification state
        setPendingVerification(true);
        setPendingEmail(data.email);
        dispatch({ type: 'LOGIN_ERROR', payload: '' });
      }
    } catch (error: any) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message || 'Registration failed' });
      throw error;
    }
  };


  const resendVerificationEmail = async () => {
    if (!pendingEmail) return;
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: pendingEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });

      if (error) throw error;

      // Update verification_sent_at timestamp
      await supabase
        .from('user_profiles')
        .update({ verification_sent_at: new Date().toISOString() })
        .eq('email', pendingEmail);
    } catch (error: any) {
      throw error;
    }
  };


  const logout = async () => {
    await supabase.auth.signOut();
    dispatch({ type: 'LOGOUT' });
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message || 'Google sign-in failed' });
      throw error;
    }
  };

  const signInWithGitHub = async () => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message || 'GitHub sign-in failed' });
      throw error;
    }
  };


  const trackSession = async (deviceInfo: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const sessionId = session.access_token.substring(0, 20);
      
      await supabase
        .from('user_sessions')
        .upsert({
          user_id: session.user.id,
          session_id: sessionId,
          device_type: deviceInfo.deviceType,
          device_name: deviceInfo.deviceName,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          ip_address: deviceInfo.ipAddress,
          location: deviceInfo.location,
          last_activity: new Date().toISOString(),
          is_current: true,
        }, {
          onConflict: 'user_id,session_id'
        });

      // Mark other sessions as not current
      await supabase
        .from('user_sessions')
        .update({ is_current: false })
        .eq('user_id', session.user.id)
        .neq('session_id', sessionId);
    } catch (error: any) {
      console.error('Failed to track session:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (state.user) {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          avatar_url: updates.avatar,
        })
        .eq('id', state.user.id);

      if (error) throw error;

      const updatedUser = { ...state.user, ...updates };
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    }
  }



  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      resetPassword,
      updateProfile,
      resendVerificationEmail,
      signInWithGoogle,
      signInWithGitHub,
      trackSession,
      pendingVerification,
    }}>
      {children}
    </AuthContext.Provider>
  );

}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
