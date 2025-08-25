// src/components/TeacherDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Home, BookOpen, Users, Calendar, BarChart3, Settings, 
  LogOut, Plus, QrCode, Clock, UserCheck, TrendingUp,
  Bell, Search, MoreHorizontal, Play, Square, 
  Eye, Download, Upload, Loader, AlertCircle,
  Copy, CheckCircle, RefreshCw, X
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TeacherDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [classGroups, setClassGroups] = useState([]);
  const [activeLecture, setActiveLecture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [attendanceList, setAttendanceList] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalLectures: 0,
    avgAttendance: 0,
    activeStudents: 0
  });

  // Fetch initial data when component mounts
  useEffect(() => {
    if (user && user.role === 'teacher') {
      fetchClassGroups();
    }
  }, [user]);

  // Auto-refresh active lecture QR code and attendance
  useEffect(() => {
    let interval;
    if (activeLecture && activeLecture.isActive) {
      interval = setInterval(() => {
        refreshLectureData();
      }, 5000); // Refresh every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeLecture]);

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

  const fetchClassGroups = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/class-groups/my-groups`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        const groups = data.classGroups || [];
        setClassGroups(groups);
        calculateStats(groups); // Calculate stats after data is fetched
      } else {
        console.error('Failed to fetch class groups:', data.message);
      }
    } catch (error) {
      console.error('Error fetching class groups:', error);
      // Don't show error to user for background fetch
    }
  };

  const calculateStats = (groups) => {
    const totalClasses = groups.length;
    const activeStudents = groups.reduce((sum, group) => {
      return sum + (group.students ? group.students.length : 0);
    }, 0);
    
    setStats({
      totalClasses: totalClasses,
      totalLectures: 0, // Will be implemented with real API
      avgAttendance: 0, // Will be implemented with real API
      activeStudents: activeStudents
    });
  };

  const createClassGroup = async () => {
    if (!formData.name.trim()) {
      showMessage('Please enter a class name', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/class-groups/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim()
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchClassGroups();
        setShowCreateForm(false);
        setFormData({ name: '', description: '' });
        showMessage('Class group created successfully!');
      } else {
        showMessage(data.message || 'Failed to create class group', 'error');
      }
    } catch (error) {
      console.error('Error creating class group:', error);
      showMessage('Failed to create class group. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const startLecture = async (classId, className) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/lectures/start`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          classId: classId,
          duration: 60 
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setActiveLecture({
          ...data.lecture,
          className: className
        });
        setQrCode(data.lecture.qrCode);
        setAttendanceCount(data.lecture.studentsJoined || 0);
        setAttendanceList([]);
        setActiveTab('lecture-live');
        showMessage(`Lecture started for ${className}!`);
      } else {
        showMessage(data.message || 'Failed to start lecture', 'error');
      }
    } catch (error) {
      console.error('Error starting lecture:', error);
      showMessage('Failed to start lecture. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const stopLecture = async () => {
    if (!activeLecture) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/lectures/stop/${activeLecture.id}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      if (data.success) {
        showMessage(`Lecture ended. ${attendanceCount} students attended.`);
        setActiveLecture(null);
        setQrCode('');
        setAttendanceCount(0);
        setAttendanceList([]);
        setActiveTab('dashboard');
      } else {
        showMessage('Failed to stop lecture', 'error');
      }
    } catch (error) {
      console.error('Error stopping lecture:', error);
      showMessage('Failed to stop lecture', 'error');
    } finally {
      setLoading(false);
    }
  };

  const refreshLectureData = async () => {
    if (!activeLecture) return;
    
    try {
      // Refresh QR code
      const qrResponse = await fetch(`${API_BASE_URL}/lectures/${activeLecture.id}/qr`, {
        headers: getAuthHeaders()
      });
      
      if (qrResponse.ok) {
        const qrData = await qrResponse.json();
        if (qrData.success) {
          setQrCode(qrData.lecture.qrCode);
          setAttendanceCount(qrData.lecture.studentsJoined || 0);
        }
      }

      // Fetch attendance list
      const attendanceResponse = await fetch(`${API_BASE_URL}/lectures/${activeLecture.id}/attendance`, {
        headers: getAuthHeaders()
      });
      
      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json();
        if (attendanceData.success) {
          setAttendanceList(attendanceData.attendance || []);
        }
      }
    } catch (error) {
      console.error('Error refreshing lecture data:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showMessage('Copied to clipboard!');
    }).catch(() => {
      showMessage('Failed to copy', 'error');
    });
  };

  const sidebar = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'classes', icon: BookOpen, label: 'Classes' },
    { id: 'lectures', icon: Calendar, label: 'Lectures' },
    { id: 'attendance', icon: UserCheck, label: 'Attendance' },
    { id: 'reports', icon: BarChart3, label: 'Reports' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  const DashboardView = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900">{classGroups.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeStudents}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Groups</p>
              <p className="text-2xl font-bold text-gray-900">
                {classGroups.filter(group => group.isActive !== false).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <QrCode className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Live Lectures</p>
              <p className="text-2xl font-bold text-gray-900">{activeLecture ? 1 : 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setActiveTab('classes')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <Plus className="w-6 h-6 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium text-gray-600">Create New Class</p>
          </button>
          
          <button 
            onClick={() => setActiveTab('lectures')}
            className="p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors text-center"
          >
            <Play className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <p className="text-sm font-medium text-green-700">View Lectures</p>
          </button>
          
          <button 
            onClick={() => setActiveTab('reports')}
            className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-center"
          >
            <BarChart3 className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <p className="text-sm font-medium text-purple-700">View Reports</p>
          </button>
        </div>
      </div>

      {/* Your Classes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Classes</h3>
        {classGroups.length > 0 ? (
          <div className="space-y-3">
            {classGroups.slice(0, 5).map((group) => (
              <div key={group._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{group.name}</h4>
                  <p className="text-sm text-gray-500">
                    {group.students ? group.students.length : 0} students • Code: {group.groupCode}
                  </p>
                  {group.description && (
                    <p className="text-xs text-gray-400 mt-1">{group.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => startLecture(group._id, group.name)}
                    disabled={loading || activeLecture}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 text-sm"
                  >
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                    Start Lecture
                  </button>
                </div>
              </div>
            ))}
            {classGroups.length > 5 && (
              <div className="text-center pt-4">
                <button 
                  onClick={() => setActiveTab('classes')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View all {classGroups.length} classes →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No classes yet. Create your first class to get started!</p>
            <button 
              onClick={() => setActiveTab('classes')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Class
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const ClassesView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Manage Classes</h2>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Class Group
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Create New Class Group</h3>
            <button 
              onClick={() => setShowCreateForm(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Computer Science 10A, Mathematics Grade 12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Optional description about the class..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={createClassGroup}
                disabled={loading || !formData.name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Class Group
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Classes Grid */}
      <div className="grid gap-6">
        {classGroups.map((group) => (
          <div key={group._id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {group.description || 'No description provided'}
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => startLecture(group._id, group.name)}
                  disabled={loading || activeLecture}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  Start Lecture
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Students</p>
                <p className="font-medium">{group.students ? group.students.length : 0}</p>
              </div>
              <div>
                <p className="text-gray-500">Group Code</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium font-mono">{group.groupCode}</p>
                  <button 
                    onClick={() => copyToClipboard(group.groupCode)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-gray-500">Created</p>
                <p className="font-medium">{new Date(group.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {classGroups.length === 0 && !showCreateForm && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Yet</h3>
          <p className="text-gray-500 mb-6">Create your first class group to start taking attendance.</p>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Create Your First Class
          </button>
        </div>
      )}
    </div>
  );

  const LiveLectureView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Live Lecture</h2>
            {activeLecture && (
              <p className="text-sm text-gray-600 mt-1">
                {activeLecture.className} • Started {new Date(activeLecture.startTime).toLocaleTimeString()}
              </p>
            )}
          </div>
          <button 
            onClick={stopLecture}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
            End Lecture
          </button>
        </div>

        {activeLecture && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* QR Code Section */}
            <div className="text-center">
              <h3 className="text-lg font-medium mb-4">Attendance QR Code</h3>
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                {qrCode ? (
                  <img src={qrCode} alt="Attendance QR Code" className="w-48 h-48 mx-auto" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <Loader className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-4 mb-2">
                Students scan this QR code to mark attendance
              </p>
              <div className="flex gap-2 justify-center">
                <button 
                  onClick={refreshLectureData}
                  className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh
                </button>
                {activeLecture.joinUrl && (
                  <button 
                    onClick={() => copyToClipboard(activeLecture.joinUrl)}
                    className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy Link
                  </button>
                )}
              </div>
            </div>

            {/* Stats Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Live Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-green-800 font-medium">Students Present</span>
                  <span className="font-bold text-green-900 text-2xl">{attendanceCount}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Started At</span>
                  <span className="font-medium">
                    {new Date(activeLecture.startTime).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">
                    {Math.floor((new Date() - new Date(activeLecture.startTime)) / 60000)} minutes
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">QR Token</span>
                  <span className="font-mono text-xs">{activeLecture.qrToken?.slice(-8)}...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Attendance */}
      {attendanceList.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Recent Check-ins</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {attendanceList.slice().reverse().map((attendance, index) => (
              <div key={attendance.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <img 
                    src={attendance.student?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(attendance.student?.name || 'Student')}&background=3b82f6&color=fff`}
                    alt={attendance.student?.name || 'Student'}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{attendance.student?.name || 'Unknown Student'}</p>
                    <p className="text-xs text-gray-500">{attendance.student?.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">Present</p>
                  <p className="text-xs text-gray-500">
                    {new Date(attendance.markedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const ComingSoonView = ({ title, description, icon: Icon }) => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center py-8">
          <Icon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 mb-6">{description}</p>
          <div className="inline-flex px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'classes':
        return <ClassesView />;
      case 'lecture-live':
        return <LiveLectureView />;
      case 'lectures':
        return <ComingSoonView 
          title="Lecture History" 
          description="View and manage your past and scheduled lectures."
          icon={Calendar}
        />;
      case 'attendance':
        return <ComingSoonView 
          title="Attendance Reports" 
          description="Detailed attendance analytics and student reports."
          icon={UserCheck}
        />;
      case 'reports':
        return <ComingSoonView 
          title="Analytics & Reports" 
          description="Comprehensive analytics, attendance trends, and detailed reports."
          icon={BarChart3}
        />;
      case 'settings':
        return <ComingSoonView 
          title="Settings" 
          description="Manage your profile, preferences, and class settings."
          icon={Settings}
        />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Qroll</h1>
              <p className="text-xs text-gray-500">Teacher Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4">
          {sidebar.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (activeTab === 'lecture-live' && item.id === 'lectures');
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors mb-1 ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={user.profilePicture} 
              alt={user.name}
              className="w-8 h-8 rounded-full"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`;
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              <p className="text-xs text-blue-600 font-medium">Teacher</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'classes' && 'Classes'}
                {activeTab === 'lecture-live' && 'Live Lecture'}
                {activeTab === 'lectures' && 'Lectures'}
                {activeTab === 'attendance' && 'Attendance'}
                {activeTab === 'reports' && 'Reports'}
                {activeTab === 'settings' && 'Settings'}
              </h1>
              <p className="text-sm text-gray-600">Welcome back, {user.name?.split(' ')[0]}!</p>
            </div>
            
            <div className="flex items-center gap-4">
              {activeLecture && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Lecture Live • {attendanceCount} students
                </div>
              )}
              
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Messages */}
        {(error || success) && (
          <div className="px-6 py-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
                <button 
                  onClick={() => setError('')}
                  className="ml-auto p-1 hover:bg-red-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">{success}</span>
                <button 
                  onClick={() => setSuccess('')}
                  className="ml-auto p-1 hover:bg-green-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;