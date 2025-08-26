import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  QrCode,
  Camera,
  User,
  LogOut,
  Bell,
  Settings,
  BookOpen,
  Play,
  Loader
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentDashboard = ({ user, onLogout }) => {
  const [activeSessions, setActiveSessions] = useState([]);
  const [joinedSessions, setJoinedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mock data for active sessions
  const mockActiveSessions = [
    {
      id: '1',
      className: 'Mathematics 101',
      teacherName: 'Dr. Smith',
      section: 'A',
      startTime: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
      studentsJoined: 24,
      totalStudents: 30,
      isLive: true
    },
    {
      id: '2',
      className: 'Physics Lab',
      teacherName: 'Prof. Johnson',
      section: 'B',
      startTime: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
      studentsJoined: 18,
      totalStudents: 25,
      isLive: true
    },
    {
      id: '3',
      className: 'Chemistry Basics',
      teacherName: 'Dr. Wilson',
      section: 'C',
      startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
      studentsJoined: 32,
      totalStudents: 35,
      isLive: true
    }
  ];

  const getAuthHeaders = () => {
    const token = localStorage.getItem('qroll_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const showMessage = (message, type = 'success') => {
    if (type === 'error') {
      setError(message);
      setSuccess('');
    } else {
      setSuccess(message);
      setError('');
    }
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 5000);
  };

  useEffect(() => {
    const loadActiveLectures = async () => {
      try {
        setLoading(true);
        // Fetch student's enrolled class groups first
        const classGroupsResponse = await fetch(`${API_BASE_URL}/class-groups/student/my-groups`, {
          headers: getAuthHeaders()
        });
        
        if (classGroupsResponse.ok) {
          const classGroupsData = await classGroupsResponse.json();
          if (classGroupsData.success) {
            // For each class group, check for active lectures
            const activeLectures = [];
            for (const group of classGroupsData.classGroups || []) {
              try {
                const lectureResponse = await fetch(`${API_BASE_URL}/lectures/active/${group._id}`, {
                  headers: getAuthHeaders()
                });
                if (lectureResponse.ok) {
                  const lectureData = await lectureResponse.json();
                  if (lectureData.success) {
                    activeLectures.push({
                      id: lectureData.lecture.id,
                      className: group.name,
                      teacherName: lectureData.lecture.teacherName,
                      section: 'A',
                      startTime: new Date(lectureData.lecture.startTime),
                      studentsJoined: lectureData.lecture.studentsJoined,
                      totalStudents: group.students ? group.students.length : 0,
                      isLive: lectureData.lecture.isActive
                    });
                  }
                }
              } catch (error) {
                console.error(`Error fetching lecture for group ${group._id}:`, error);
              }
            }
            setActiveSessions(activeLectures);
          }
        } else {
          // Fallback to mock data if API fails
          setActiveSessions(mockActiveSessions);
        }
      } catch (error) {
        console.error('Error loading sessions:', error);
        setActiveSessions(mockActiveSessions); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'student') {
      loadActiveLectures();
    }
  }, [user]);

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const joinSession = async (sessionId) => {
    try {
      const session = activeSessions.find(s => s.id === sessionId);
      if (!session) {
        showMessage('Session not found', 'error');
        return;
      }

      if (joinedSessions.includes(sessionId)) {
        showMessage('Already joined this session', 'error');
        return;
      }

      // Get the lecture's QR token first
      const qrResponse = await fetch(`${API_BASE_URL}/lectures/${sessionId}/qr`, {
        headers: getAuthHeaders()
      });

      if (!qrResponse.ok) {
        showMessage('Failed to get session details', 'error');
        return;
      }

      const qrData = await qrResponse.json();
      if (!qrData.success) {
        showMessage('Session is no longer active', 'error');
        return;
      }

      // Join the lecture using the QR token
      const joinResponse = await fetch(`${API_BASE_URL}/lectures/join/${qrData.lecture.qrToken}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          latitude: null, // Could add geolocation later
          longitude: null
        })
      });

      const joinData = await joinResponse.json();
      if (joinData.success) {
        setJoinedSessions([...joinedSessions, sessionId]);
        triggerConfetti();
        showMessage(`Successfully joined ${session.className}!`);
        
        // Update student count optimistically
        setActiveSessions(prev => 
          prev.map(s => 
            s.id === sessionId 
              ? { ...s, studentsJoined: s.studentsJoined + 1 }
              : s
          )
        );
      } else {
        showMessage(joinData.message || 'Failed to join session', 'error');
      }
    } catch (error) {
      console.error('Error joining session:', error);
      showMessage('Failed to join session. Please try again.', 'error');
    }
  };

  const formatTimeAgo = (date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return 'Just started';
    if (minutes === 1) return '1 min ago';
    return `${minutes} mins ago`;
  };

  const ConfettiAnimation = () => (
    <div className={`fixed inset-0 pointer-events-none z-50 ${showConfetti ? 'block' : 'hidden'}`}>
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 3}s`
          }}
        >
          <Sparkles 
            className={`w-4 h-4 text-${['yellow', 'pink', 'blue', 'green', 'purple'][Math.floor(Math.random() * 5)]}-400`}
          />
        </div>
      ))}
    </div>
  );

  const SessionCard = ({ session }) => {
    const isJoined = joinedSessions.includes(session.id);
    const attendancePercentage = Math.round((session.studentsJoined / session.totalStudents) * 100);
    
    return (
      <div className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isJoined 
          ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' 
          : 'border-gray-200 hover:border-blue-300'
      }`}>
        {/* Glowing effect for active sessions */}
        <div className={`absolute inset-0 rounded-xl transition-opacity duration-500 ${
          session.isLive && !isJoined
            ? 'bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse'
            : 'opacity-0'
        }`} />
        
        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                isJoined ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                <BookOpen className={`w-5 h-5 ${
                  isJoined ? 'text-green-600' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{session.className}</h3>
                <p className="text-sm text-gray-600">Section {session.section} • {session.teacherName}</p>
              </div>
            </div>
            
            {session.isLive && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-red-700">LIVE</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Clock className="w-4 h-4 text-gray-400 mr-1" />
              </div>
              <p className="text-xs text-gray-500">Started</p>
              <p className="text-sm font-medium text-gray-900">{formatTimeAgo(session.startTime)}</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Users className="w-4 h-4 text-gray-400 mr-1" />
              </div>
              <p className="text-xs text-gray-500">Attendance</p>
              <p className="text-sm font-medium text-gray-900">{session.studentsJoined}/{session.totalStudents}</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Wifi className="w-4 h-4 text-gray-400 mr-1" />
              </div>
              <p className="text-xs text-gray-500">Rate</p>
              <p className="text-sm font-medium text-gray-900">{attendancePercentage}%</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Attendance Progress</span>
              <span>{attendancePercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  attendancePercentage >= 80 ? 'bg-green-500' :
                  attendancePercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${attendancePercentage}%` }}
              />
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={() => joinSession(session.id)}
            disabled={isJoined}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              isJoined
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transform hover:scale-105'
            }`}
          >
            {isJoined ? (
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Joined Successfully</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <QrCode className="w-4 h-4" />
                <span>Join Session</span>
              </div>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <ConfettiAnimation />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">QRoll Student</h1>
                <p className="text-sm text-gray-600">Join live sessions instantly</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <img
                  src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=3b82f6&color=fff`}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">Student</p>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {(error || success) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">{success}</span>
            </div>
          )}
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
            <p className="text-blue-100">Ready to join some amazing classes? Check out the live sessions below.</p>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sessions Joined</p>
                <p className="text-2xl font-bold text-gray-900">{joinedSessions.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Play className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Live Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{activeSessions.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">95%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active sessions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Live Sessions</h3>
              <p className="text-gray-600">Join active classroom sessions</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span>Live updates</span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : activeSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Live Sessions</h3>
              <p className="text-gray-600">Check back later for active classroom sessions</p>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <QrCode className="w-6 h-6 text-blue-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-blue-900">Scan QR Code</p>
                <p className="text-sm text-blue-600">Join session with QR</p>
              </div>
            </button>
            
            <button className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <Camera className="w-6 h-6 text-purple-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-purple-900">Enter Session Code</p>
                <p className="text-sm text-purple-600">Join with manual code</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
