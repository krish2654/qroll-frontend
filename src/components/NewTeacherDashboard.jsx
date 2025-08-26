import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  BookOpen, 
  Users, 
  Play, 
  BarChart3, 
  Plus, 
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Calendar,
  Clock,
  TrendingUp,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import QRCode from 'qrcode';

const NewTeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', section: '', description: '' });
  // Sessions state
  const [selectedClassId, setSelectedClassId] = useState('');
  const [currentSession, setCurrentSession] = useState(null); // { id, code }
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [attendance, setAttendance] = useState([]); // [{id, name, time}]
  const [sessionLoading, setSessionLoading] = useState(false);
  const attendanceTimerRef = useRef(null);

  // Navigation items
  const navigation = [
    { id: 'overview', name: 'Overview', icon: Home },
    { id: 'classes', name: 'Classes', icon: BookOpen },
    { id: 'sessions', name: 'Sessions', icon: Play },
    { id: 'reports', name: 'Reports', icon: BarChart3 },
  ];

  // Fetch classes
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/classes');
      setClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClass.name.trim()) return;

    try {
      const response = await api.post('/classes', newClass);
      setClasses([...classes, response.data]);
      setNewClass({ name: '', section: '', description: '' });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  // Stats data
  const stats = [
    { name: 'Total Classes', value: classes.length, icon: BookOpen, color: 'blue' },
    { name: 'Students', value: '156', icon: Users, color: 'green' },
    { name: 'Lectures', value: '24', icon: GraduationCap, color: 'purple' },
    { name: 'Active Sessions', value: '3', icon: Play, color: 'orange' }
  ];

  // Recent activity
  const recentActivity = [
    { action: 'Created new class', subject: 'Mathematics 101', time: '2 hours ago' },
    { action: 'Started session', subject: 'Physics Lab', time: '4 hours ago' },
    { action: 'Added lecture', subject: 'Chemistry Basics', time: '1 day ago' },
  ];

  const renderOverview = () => (
    <div className="space-y-4">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100">Ready to inspire minds today? Let's make learning amazing.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-5 h-5 text-blue-600 mr-3" />
            <span className="font-medium text-blue-900">Create New Class</span>
          </button>
          <button
            onClick={() => setCurrentPage('sessions')}
            className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Play className="w-5 h-5 text-green-600 mr-3" />
            <span className="font-medium text-green-900">Start Session</span>
          </button>
          <button
            onClick={() => setCurrentPage('reports')}
            className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <BarChart3 className="w-5 h-5 text-purple-600 mr-3" />
            <span className="font-medium text-purple-900">View Reports</span>
          </button>
        </div>
      </div>

      {/* Recent Activity & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-2.5">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center p-2.5 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.subject}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h2>
          <div className="text-center py-6 text-gray-500">
            <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>No sessions scheduled for today</p>
            <button
              onClick={() => setCurrentPage('sessions')}
              className="mt-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Schedule a session
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderClasses = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-600">Manage your classes and subjects</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Class
        </button>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <div
              key={cls._id}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {cls.subjects?.length || 0} subjects
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{cls.name}</h3>
              
              {cls.section && (
                <p className="text-sm text-gray-600 mb-2">Section: {cls.section}</p>
              )}
              
              {cls.description && (
                <p className="text-sm text-gray-600 mb-4">{cls.description}</p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{cls.totalStudents || 0} students</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No classes yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first class</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Class
          </button>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (currentPage) {
      case 'overview':
        return renderOverview();
      case 'classes':
        return renderClasses();
      case 'sessions':
        return renderSessions();
      case 'reports':
        return (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Reports</h3>
            <p className="text-gray-600">Analytics and reports coming soon</p>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  // ----- Sessions helpers -----
  const generateQRCode = async (payload) => {
    try {
      const url = typeof payload === 'string' ? payload : JSON.stringify(payload);
      const dataUrl = await QRCode.toDataURL(url, { width: 256, margin: 1 });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('QR generation failed:', err);
      setQrDataUrl('');
    }
  };

  const startPollingAttendance = (sessionId) => {
    stopPollingAttendance();
    attendanceTimerRef.current = setInterval(async () => {
      try {
        // Adjust endpoint to match backend. Expected: returns array of attendees
        const res = await api.get(`/sessions/${sessionId}/attendance`);
        const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
        setAttendance(list);
      } catch (e) {
        // Keep UI running even if polling fails once
        console.warn('Attendance polling error:', e?.message || e);
      }
    }, 4000);
  };

  const stopPollingAttendance = () => {
    if (attendanceTimerRef.current) {
      clearInterval(attendanceTimerRef.current);
      attendanceTimerRef.current = null;
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => stopPollingAttendance();
  }, []);

  const startSession = async () => {
    if (!selectedClassId) return;
    try {
      setSessionLoading(true);
      // Backend contract assumption: returns { id, code }
      const res = await api.post('/sessions', { classId: selectedClassId });
      const sess = res?.data || res || {};
      if (!sess.id) {
        // Fallback client-side session id/code if backend not ready
        const fallback = {
          id: `local-${Date.now()}`,
          code: Math.random().toString(36).slice(2, 8).toUpperCase(),
        };
        setCurrentSession(fallback);
        await generateQRCode({ type: 'qroll-session', sessionId: fallback.id, code: fallback.code });
        setAttendance([]);
        startPollingAttendance(fallback.id);
        return;
      }
      setCurrentSession(sess);
      // Encode minimal join payload; consumers can scan and open app/web to join
      await generateQRCode({ type: 'qroll-session', sessionId: sess.id, code: sess.code });
      setAttendance([]);
      startPollingAttendance(sess.id);
    } catch (err) {
      console.error('Failed to start session:', err);
      // Provide resilient local fallback when API fails
      const fallback = {
        id: `local-${Date.now()}`,
        code: Math.random().toString(36).slice(2, 8).toUpperCase(),
      };
      setCurrentSession(fallback);
      await generateQRCode({ type: 'qroll-session', sessionId: fallback.id, code: fallback.code });
      setAttendance([]);
      startPollingAttendance(fallback.id);
    } finally {
      setSessionLoading(false);
    }
  };

  const stopSession = async () => {
    if (!currentSession) return;
    try {
      setSessionLoading(true);
      // Best-effort stop; ignore errors
      await api.post(`/sessions/${currentSession.id}/stop`, {});
    } catch (_) {
      // ignore
    } finally {
      stopPollingAttendance();
      setCurrentSession(null);
      setQrDataUrl('');
      setAttendance([]);
      setSessionLoading(false);
    }
  };

  const renderSessions = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Session</h1>
          <p className="text-gray-600">Start a session, display QR for students, and track attendance.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            disabled={!!currentSession}
          >
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>{c.name}{c.section ? ` • ${c.section}` : ''}</option>
            ))}
          </select>
          {!currentSession ? (
            <button
              onClick={startSession}
              disabled={!selectedClassId || sessionLoading}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Play className="w-4 h-4 mr-2" />
              Start
            </button>
          ) : (
            <button
              onClick={stopSession}
              disabled={sessionLoading}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Stop
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {currentSession ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* QR and info */}
          <div className="lg:col-span-1 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Share to Join</h2>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Session QR" className="w-56 h-56 mx-auto" />
            ) : (
              <div className="w-56 h-56 mx-auto bg-gray-100 rounded-lg animate-pulse" />
            )}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">Session Code</p>
              <p className="text-2xl font-bold tracking-widest text-gray-900">{currentSession.code}</p>
            </div>
          </div>

          {/* Attendance list */}
          <div className="lg:col-span-2 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Live Attendance</h2>
              <span className="text-sm text-gray-600">{attendance.length} joined</span>
            </div>
            <div className="max-h-80 overflow-auto divide-y divide-gray-100">
              {attendance.length === 0 ? (
                <div className="text-center py-10 text-gray-500">Waiting for students to join…</div>
              ) : (
                attendance.map((a, idx) => (
                  <div key={a.id || idx} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
                        {(a.name || 'S')[0]?.toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{a.name || 'Student'}</p>
                        <p className="text-xs text-gray-500">{a.roll || a.id}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{a.time ? new Date(a.time).toLocaleTimeString() : ''}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
          <Play className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-700 mb-1">Choose a class and start a live session.</p>
          <p className="text-sm text-gray-500">A QR code and session code will be generated for students to join.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between h-14 px-5 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">QRoll</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-6 px-3 flex-1 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <div className="flex items-center min-w-0">
              <img
                src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3b82f6&color=fff`}
                alt={user?.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-14 px-4 sm:px-5">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="ml-2 text-base font-semibold text-gray-900 capitalize lg:ml-0">
                {navigation.find(nav => nav.id === currentPage)?.name || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-3 sm:p-5">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Create New Class</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Name *
                </label>
                <input
                  type="text"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Mathematics 101"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section
                </label>
                <input
                  type="text"
                  value={newClass.section}
                  onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., A, B, C"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newClass.description}
                  onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Brief description of the class"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewTeacherDashboard;
