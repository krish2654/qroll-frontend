// Fixed version of App.jsx with Google Auth improvements
import React, { useState, useEffect } from 'react';
import { UserCheck, GraduationCap, Users, LogOut, Loader } from 'lucide-react';
import { authAPI, authStorage } from './services/api';
import { AuthProvider } from './contexts/AuthContext';
import TeacherDashboard from './components/TeacherDashboard_new';

const loadGoogleScript = () => {
  return new Promise((resolve) => {
    if (window.google) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    document.head.appendChild(script);
  });
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await loadGoogleScript();
        setGoogleLoaded(true);

        if (authStorage.isAuthenticated()) {
          const result = await authAPI.getProfile();
          if (result.success) {
            setUser(result.user);
          } else {
            authStorage.clear();
            setError('Session expired. Please login again.');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (googleLoaded && !user && !loading) {
      window.google?.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
      });

      setTimeout(() => {
        const buttonElement = document.getElementById('google-signin-button');
        if (buttonElement) {
          window.google.accounts.id.renderButton(buttonElement, {
            theme: 'outline',
            size: 'large',
            width: 320, // Fixed width instead of 100%
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left'
          });
        }
      }, 100);
    }
  }, [googleLoaded, user, loading]);

  const handleGoogleResponse = async (response) => {
    setAuthLoading(true);
    setError('');
    
    try {
      console.log('Google response received, calling backend...');
      const result = await authAPI.googleLogin(response.credential);
      
      if (result.success) {
        setUser(result.user);
        console.log('Login successful:', result.user.name);
        
        // Show success message
        if (result.user.isNewUser) {
          setError(''); // Clear any errors
        }
      } else {
        setError(`Login failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Google response error:', error);
      setError('Login failed. Please check your connection and try again.');
    }
    
    setAuthLoading(false);
  };

  const handleRoleSelection = async (role) => {
    if (!user) return;
    
    setAuthLoading(true);
    setError('');
    
    try {
      console.log(`Setting role to: ${role}`);
      const result = await authAPI.setRole(role);
      
      if (result.success) {
        setUser(result.user);
        console.log(`Role set successfully to: ${role}`);
      } else {
        setError(`Failed to set role: ${result.error}`);
      }
    } catch (error) {
      console.error('Role selection error:', error);
      setError('Failed to set role. Please try again.');
    }
    
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    setAuthLoading(true);
    setError('');
    
    try {
      await authAPI.logout();
      setUser(null);
      console.log('Logout successful');
      
      if (window.google?.accounts.id) {
        window.google.accounts.id.disableAutoSelect();
      }
    } catch (error) {
      console.error('Logout error:', error);
      setError('Logout failed. Please try again.');
    }
    
    setAuthLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading Qroll...</p>
          <p className="text-sm text-gray-500 mt-2">Connecting to backend...</p>
        </div>
      </div>
    );
  }

  // Fully authenticated user with role
  if (user && user.role) {
    // Route to appropriate dashboard based on role
    if (user.role === 'teacher') {
      return (
        <AuthProvider>
          <TeacherDashboard user={user} onLogout={handleLogout} />
        </AuthProvider>
      );
    }
    
    if (user.role === 'student') {
      // Student dashboard will be implemented next
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
            <div className="mb-6">
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-4 border-green-100">
                <img 
                  src={user.profilePicture} 
                  alt={user.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`;
                  }}
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
              <p className="text-gray-600 mt-2">🚧 Coming Soon!</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Logged in as:</p>
              <p className="font-semibold text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                  👨‍🎓 Student
                </span>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              disabled={authLoading}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {authLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              Logout
            </button>
          </div>
        </div>
      );
    }
  }

  // User logged in but no role selected
  if (user && !user.role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-4 border-blue-100">
              <img 
                src={user.profilePicture} 
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`;
                }}
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Hi {user.name?.split(' ')[0]}! 👋</h1>
            <p className="text-gray-600 mt-2">Choose your role to continue</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleRoleSelection('teacher')}
                disabled={authLoading}
                className="p-4 border-2 border-blue-500 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all disabled:opacity-50"
              >
                {authLoading ? (
                  <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />
                ) : (
                  <GraduationCap className="w-6 h-6 mx-auto mb-2" />
                )}
                <p className="text-sm font-medium">Teacher</p>
              </button>
              
              <button
                onClick={() => handleRoleSelection('student')}
                disabled={authLoading}
                className="p-4 border-2 border-green-500 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-all disabled:opacity-50"
              >
                {authLoading ? (
                  <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />
                ) : (
                  <Users className="w-6 h-6 mx-auto mb-2" />
                )}
                <p className="text-sm font-medium">Student</p>
              </button>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            disabled={authLoading}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm disabled:opacity-50"
          >
            Use Different Account
          </button>
        </div>
      </div>
    );
  }

  // Initial login screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Qroll</h1>
          <p className="text-gray-600">Smart Attendance System</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Sign in with your Google account
            </label>
            
            {googleLoaded ? (
              <div className="relative flex justify-center">
                <div 
                  id="google-signin-button" 
                  style={{ display: authLoading ? 'none' : 'block' }}
                />
                {authLoading && (
                  <div className="w-80 bg-white border-2 border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3">
                    <Loader className="w-5 h-5 animate-spin" />
                    Signing in...
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full bg-gray-100 border-2 border-gray-300 text-gray-500 font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3">
                <Loader className="w-5 h-5 animate-spin" />
                Loading Google Sign-In...
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            🔒 Secure authentication with Google
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Backend: {import.meta.env.VITE_API_URL || 'localhost:5000'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;