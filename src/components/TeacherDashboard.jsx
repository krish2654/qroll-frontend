import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Users, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  Settings,
  Search,
  Filter,
  MoreVertical,
  Edit3,
  Trash2,
  LogOut,
  Bell,
  MapPin,
  Clock,
  Copy,
  ChevronRight,
  School,
  MessageSquare,
  Loader,
  CheckCircle,
  AlertCircle,
  X,
  QrCode,
  TrendingUp,
  Activity,
  Star,
  Globe,
  Shield,
  Play,
  Square,
  FileText,
  Upload,
  Download,
  Share2,
  Eye,
  PieChart,
  Calendar as CalendarIcon,
  UserCheck,
  Timer,
  Wifi,
  WifiOff,
  Maximize2,
  Minimize2
} from 'lucide-react';
import QRCode from 'qrcode';

const TeachersDashboard = ({ user, onLogout }) => {
  // State for class groups
  const [classGroups, setClassGroups] = useState([
    {
      _id: "1",
      name: "TY.IT",
      description: "Third Year Information Technology",
      groupCode: "TYIT24",
      classes: [
        {
          _id: "c1",
          subject: "Data Structures & Algorithms",
          studentCount: 45,
          schedule: { days: ["Monday", "Wednesday", "Friday"], startTime: "09:00", endTime: "10:30", room: "Lab 1" },
          lastSession: "2024-08-22",
          attendanceRate: 89,
          isActive: true,
          activeLecture: null, // Will hold active lecture data
          files: [
            { id: 1, name: "DSA Chapter 1 - Introduction.pdf", size: "2.4 MB", uploadedAt: "2024-08-20", downloads: 23 },
            { id: 2, name: "Sorting Algorithms Notes.docx", size: "1.8 MB", uploadedAt: "2024-08-18", downloads: 31 }
          ]
        },
        {
          _id: "c2", 
          subject: "Database Management Systems",
          studentCount: 42,
          schedule: { days: ["Tuesday", "Thursday"], startTime: "11:00", endTime: "12:30", room: "Room 201" },
          lastSession: "2024-08-21",
          attendanceRate: 92,
          isActive: true,
          activeLecture: null,
          files: [
            { id: 3, name: "ER Diagrams Tutorial.pdf", size: "3.1 MB", uploadedAt: "2024-08-19", downloads: 28 }
          ]
        }
      ],
      settings: {
        joinPermissions: "college-only",
        allowBroadcast: true,
        autoApprove: true
      },
      totalStudents: 45,
      createdAt: "2024-08-01"
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateGroupForm, setShowCreateGroupForm] = useState(false);
  const [showManageGroup, setShowManageGroup] = useState(null);
  const [showLectureModal, setShowLectureModal] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(null);
  const [showFileManager, setShowFileManager] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "45 students joined TY.IT group", time: "2 hours ago", type: "info" },
    { id: 2, message: "Web Development class starts in 30 mins", time: "30 mins ago", type: "warning" }
  ]);

  // QR Code refresh interval
  const qrIntervals = useRef(new Map());

  // Calculate dashboard statistics
  const totalGroups = classGroups.length;
  const totalClasses = classGroups.reduce((sum, group) => sum + group.classes.length, 0);
  const totalStudents = classGroups.reduce((sum, group) => sum + group.totalStudents, 0);
  const avgAttendance = Math.round(
    classGroups.reduce((sum, group) => 
      sum + group.classes.reduce((classSum, cls) => classSum + cls.attendanceRate, 0), 0
    ) / totalClasses
  );

  const filteredGroups = classGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.classes.some(cls => cls.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateGroup = (newGroup) => {
    setClassGroups([newGroup, ...classGroups]);
    setShowCreateGroupForm(false);
  };

  const copyGroupCode = (groupCode) => {
    navigator.clipboard.writeText(groupCode);
    setNotifications(prev => [{
      id: Date.now(),
      message: `Group code "${groupCode}" copied to clipboard!`,
      time: "now",
      type: "success"
    }, ...prev.slice(0, 4)]);
  };

  // Start lecture function
  const startLecture = async (groupId, classId) => {
    const lectureId = `lecture_${Date.now()}`;
    const lecture = {
      id: lectureId,
      startTime: new Date(),
      qrCode: null,
      qrToken: `${lectureId}_${Math.random().toString(36).substr(2, 9)}`,
      studentsJoined: 0,
      isActive: true
    };

    // Generate QR code
    try {
      const qrCodeUrl = await QRCode.toDataURL(
        `${import.meta.env.VITE_API_URL}/join-lecture/${lecture.qrToken}`,
        { width: 200, margin: 2 }
      );
      lecture.qrCode = qrCodeUrl;
    } catch (error) {
      console.error('QR code generation failed:', error);
    }

    // Update class with active lecture
    setClassGroups(prev => prev.map(group => 
      group._id === groupId 
        ? {
            ...group,
            classes: group.classes.map(cls => 
              cls._id === classId 
                ? { ...cls, activeLecture: lecture }
                : cls
            )
          }
        : group
    ));

    // Set up QR refresh interval
    const interval = setInterval(() => {
      refreshQRCode(groupId, classId, lectureId);
    }, 5000);
    qrIntervals.current.set(lectureId, interval);

    setNotifications(prev => [{
      id: Date.now(),
      message: "Lecture started successfully! QR code is now active.",
      time: "now",
      type: "success"
    }, ...prev.slice(0, 4)]);
  };

  // Stop lecture function
  const stopLecture = (groupId, classId) => {
    setClassGroups(prev => prev.map(group => 
      group._id === groupId 
        ? {
            ...group,
            classes: group.classes.map(cls => 
              cls._id === classId 
                ? { ...cls, activeLecture: null }
                : cls
            )
          }
        : group
    ));

    // Clear QR refresh interval
    const group = classGroups.find(g => g._id === groupId);
    const cls = group?.classes.find(c => c._id === classId);
    if (cls?.activeLecture?.id) {
      const interval = qrIntervals.current.get(cls.activeLecture.id);
      if (interval) {
        clearInterval(interval);
        qrIntervals.current.delete(cls.activeLecture.id);
      }
    }

    setNotifications(prev => [{
      id: Date.now(),
      message: "Lecture ended. Attendance data saved.",
      time: "now",
      type: "info"
    }, ...prev.slice(0, 4)]);
  };

  // Refresh QR code
  const refreshQRCode = async (groupId, classId, lectureId) => {
    const newToken = `${lectureId}_${Math.random().toString(36).substr(2, 9)}`;
    try {
      const qrCodeUrl = await QRCode.toDataURL(
        `${import.meta.env.VITE_API_URL}/join-lecture/${newToken}`,
        { width: 200, margin: 2 }
      );

      setClassGroups(prev => prev.map(group => 
        group._id === groupId 
          ? {
              ...group,
              classes: group.classes.map(cls => 
                cls._id === classId && cls.activeLecture?.id === lectureId
                  ? { 
                      ...cls, 
                      activeLecture: { 
                        ...cls.activeLecture, 
                        qrToken: newToken,
                        qrCode: qrCodeUrl 
                      }
                    }
                  : cls
              )
            }
          : group
      ));
    } catch (error) {
      console.error('QR refresh failed:', error);
    }
  };

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      qrIntervals.current.forEach((interval) => {
        clearInterval(interval);
      });
      qrIntervals.current.clear();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">Qroll</h1>
              </div>
              <nav className="hidden md:ml-8 md:flex space-x-8">
                <a href="#" className="text-blue-600 border-b-2 border-blue-600 px-1 pb-2 text-sm font-medium">
                  Dashboard
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 px-1 pb-2 text-sm font-medium">
                  Analytics
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 px-1 pb-2 text-sm font-medium">
                  Reports
                </a>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <img
                  className="h-8 w-8 rounded-full ring-2 ring-blue-100"
                  src={user.profilePicture}
                  alt={user.name}
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-700">{user.name}</p>
                  <p className="text-xs text-gray-500">Teacher</p>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Teachers Dashboard</h2>
            <p className="text-gray-600 mt-2">Manage your class groups, start lectures, and track attendance</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-3" />
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <School className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Class Groups</dt>
                    <dd className="text-2xl font-bold text-gray-900">{totalGroups}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Subjects</dt>
                    <dd className="text-2xl font-bold text-gray-900">{totalClasses}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                    <dd className="text-2xl font-bold text-gray-900">{totalStudents}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Attendance</dt>
                    <dd className="text-2xl font-bold text-gray-900">{avgAttendance}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Class Groups Section */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Class Groups</h3>
                <button
                  onClick={() => setShowCreateGroupForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </button>
              </div>
              
              {/* Search and Filter */}
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search groups or subjects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full"
                    />
                  </div>
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>

            {/* Groups List */}
            <div className="divide-y divide-gray-200">
              {filteredGroups.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <School className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No class groups found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {classGroups.length === 0 
                      ? "Get started by creating your first class group."
                      : "Try adjusting your search terms."
                    }
                  </p>
                  {classGroups.length === 0 && (
                    <div className="mt-6">
                      <button
                        onClick={() => setShowCreateGroupForm(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Group
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <div key={group._id} className="px-6 py-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <School className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-lg font-semibold text-gray-900">{group.name}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full flex items-center ${
                                group.settings.joinPermissions === 'college-only' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {group.settings.joinPermissions === 'college-only' ? (
                                  <>
                                    <Shield className="w-3 h-3 mr-1" />
                                    College Only
                                  </>
                                ) : (
                                  <>
                                    <Globe className="w-3 h-3 mr-1" />
                                    Anywhere
                                  </>
                                )}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-500">{group.totalStudents} students</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-sm text-gray-500">{group.classes.length} subjects</span>
                              <span className="text-gray-300">•</span>
                              <button
                                onClick={() => copyGroupCode(group.groupCode)}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Code: {group.groupCode}
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Subjects in this group */}
                        <div className="ml-15">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {group.classes.map((cls) => (
                              <div key={cls._id} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <h5 className="text-sm font-medium text-gray-900 truncate">{cls.subject}</h5>
                                      {cls.activeLecture && (
                                        <div className="flex items-center">
                                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                          <span className="text-xs text-green-600 ml-1">Live</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                                      <span>{cls.studentCount} students</span>
                                      <span>{cls.attendanceRate}% attendance</span>
                                      {cls.schedule.room && <span>{cls.schedule.room}</span>}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    {/* Start/Stop Lecture Button */}
                                    {cls.activeLecture ? (
                                      <button 
                                        onClick={() => stopLecture(group._id, cls._id)}
                                        className="p-1 text-red-600 hover:text-red-700 rounded hover:bg-red-50"
                                        title="Stop Lecture"
                                      >
                                        <Square className="h-4 w-4" />
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => startLecture(group._id, cls._id)}
                                        className="p-1 text-green-600 hover:text-green-700 rounded hover:bg-green-50"
                                        title="Start Lecture"
                                      >
                                        <Play className="h-4 w-4" />
                                      </button>
                                    )}
                                    
                                    {/* QR Code Button */}
                                    <button 
                                      onClick={() => setShowLectureModal({group, class: cls})}
                                      className={`p-1 rounded hover:bg-blue-50 ${
                                        cls.activeLecture ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400'
                                      }`}
                                      title="View QR Code"
                                      disabled={!cls.activeLecture}
                                    >
                                      <QrCode className="h-4 w-4" />
                                    </button>
                                    
                                    {/* Analytics Button */}
                                    <button 
                                      onClick={() => setShowAnalytics({group, class: cls})}
                                      className="p-1 text-gray-400 hover:text-purple-600 rounded hover:bg-purple-50"
                                      title="View Analytics"
                                    >
                                      <BarChart3 className="h-4 w-4" />
                                    </button>

                                    {/* File Manager Button */}
                                    <button 
                                      onClick={() => setShowFileManager({group, class: cls})}
                                      className="p-1 text-gray-400 hover:text-orange-600 rounded hover:bg-orange-50"
                                      title="Manage Files"
                                    >
                                      <FileText className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button 
                          onClick={() => setShowManageGroup(group)}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 rounded-full hover:bg-green-50">
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showCreateGroupForm && (
        <CreateGroupModal
          onClose={() => setShowCreateGroupForm(false)}
          onGroupCreated={handleCreateGroup}
        />
      )}

      {showManageGroup && (
        <ManageGroupModal
          group={showManageGroup}
          onClose={() => setShowManageGroup(null)}
          onGroupUpdated={(updatedGroup) => {
            setClassGroups(prev => prev.map(g => 
              g._id === updatedGroup._id ? updatedGroup : g
            ));
            setShowManageGroup(null);
          }}
        />
      )}

      {showLectureModal && (
        <LectureQRModal
          group={showLectureModal.group}
          classData={showLectureModal.class}
          onClose={() => setShowLectureModal(null)}
        />
      )}

      {showAnalytics && (
        <AnalyticsModal
          group={showAnalytics.group}
          classData={showAnalytics.class}
          onClose={() => setShowAnalytics(null)}
        />
      )}

      {showFileManager && (
        <FileManagerModal
          group={showFileManager.group}
          classData={showFileManager.class}
          onClose={() => setShowFileManager(null)}
          onFilesUpdated={(groupId, classId, newFiles) => {
            setClassGroups(prev => prev.map(group => 
              group._id === groupId 
                ? {
                    ...group,
                    classes: group.classes.map(cls => 
                      cls._id === classId 
                        ? { ...cls, files: newFiles }
                        : cls
                    )
                  }
                : group
            ));
          }}
        />
      )}
    </div>
  );
};

// Lecture QR Modal Component
const LectureQRModal = ({ group, classData, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!classData.activeLecture) {
    return null;
  }

  const shareQR = () => {
    if (navigator.share) {
      navigator.share({
        title: `Join ${classData.subject} Lecture`,
        text: `Join the live lecture for ${classData.subject}`,
        url: `${import.meta.env.VITE_API_URL}/join-lecture/${classData.activeLecture.qrToken}`
      });
    } else {
      navigator.clipboard.writeText(`${import.meta.env.VITE_API_URL}/join-lecture/${classData.activeLecture.qrToken}`);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 ${isFullscreen ? 'bg-black bg-opacity-80' : ''}`}>
      <div className={`relative mx-auto p-0 border shadow-lg rounded-lg bg-white ${
        isFullscreen 
          ? 'top-10 w-11/12 max-w-2xl' 
          : 'top-20 w-11/12 max-w-lg'
      }`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Live Lecture QR Code</h3>
            <p className="text-sm text-gray-500 mt-1">{classData.subject} - {group.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="p-6">
          <div className="text-center">
            {/* Live Status */}
            <div className="flex items-center justify-center mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-green-600 font-medium">Lecture is Live</span>
            </div>

            {/* QR Code */}
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 inline-block mb-4">
              {classData.activeLecture.qrCode ? (
                <img 
                  src={classData.activeLecture.qrCode} 
                  alt="QR Code" 
                  className={`mx-auto ${isFullscreen ? 'w-64 h-64' : 'w-48 h-48'}`}
                />
              ) : (
                <div className={`${isFullscreen ? 'w-64 h-64' : 'w-48 h-48'} bg-gray-100 rounded-lg flex items-center justify-center`}>
                  <Loader className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Students can scan this QR code to join the lecture
            </p>
            <p className="text-xs text-blue-600 mb-6">
              QR code refreshes every 5 seconds for security
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">{classData.activeLecture.studentsJoined}</div>
                <div className="text-sm text-blue-700">Students Joined</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">
                  {Math.floor((Date.now() - new Date(classData.activeLecture.startTime)) / 60000)}m
                </div>
                <div className="text-sm text-green-700">Duration</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-3">
              <button
                onClick={shareQR}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Link
              </button>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = `${classData.subject}_QR.png`;
                  link.href = classData.activeLecture.qrCode;
                  link.click();
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Download QR
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Analytics Modal Component
const AnalyticsModal = ({ group, classData, onClose }) => {
  const [timeRange, setTimeRange] = useState('week');
  
  // Mock analytics data
  const analyticsData = {
    attendanceByDate: [
      { date: '2024-08-19', present: 38, absent: 7, total: 45 },
      { date: '2024-08-20', present: 42, absent: 3, total: 45 },
      { date: '2024-08-21', present: 40, absent: 5, total: 45 },
      { date: '2024-08-22', present: 41, absent: 4, total: 45 },
      { date: '2024-08-23', present: 39, absent: 6, total: 45 }
    ],
    topAttendees: [
      { name: 'Aman Sharma', attendance: 95, avatar: 'AS' },
      { name: 'Priya Patel', attendance: 92, avatar: 'PP' },
      { name: 'Rahul Singh', attendance: 90, avatar: 'RS' }
    ],
    lowAttendees: [
      { name: 'Vikash Kumar', attendance: 65, avatar: 'VK' },
      { name: 'Sneha Gupta', attendance: 68, avatar: 'SG' },
      { name: 'Arjun Mehta', attendance: 70, avatar: 'AM' }
    ]
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-0 border w-11/12 max-w-4xl shadow-lg rounded-lg bg-white">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Analytics Dashboard</h3>
            <p className="text-sm text-gray-500 mt-1">{classData.subject} - {group.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Time Range Selector */}
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-md font-medium text-gray-900">Attendance Analytics</h4>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="semester">This semester</option>
            </select>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{classData.attendanceRate}%</div>
              <div className="text-sm text-blue-700">Overall Attendance</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(analyticsData.attendanceByDate.reduce((sum, day) => sum + day.present, 0) / analyticsData.attendanceByDate.length)}
              </div>
              <div className="text-sm text-green-700">Avg Daily Present</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {analyticsData.attendanceByDate.length}
              </div>
              <div className="text-sm text-yellow-700">Total Sessions</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {analyticsData.lowAttendees.length}
              </div>
              <div className="text-sm text-purple-700">At Risk Students</div>
            </div>
          </div>

          {/* Charts and Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Chart */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-4">Daily Attendance Trend</h5>
              <div className="space-y-3">
                {analyticsData.attendanceByDate.map((day, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-20 text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1 mx-3">
                      <div className="bg-gray-200 rounded-full h-4 relative">
                        <div 
                          className="bg-green-500 h-4 rounded-full" 
                          style={{ width: `${(day.present / day.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {day.present}/{day.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-4">Top Performers</h5>
              <div className="space-y-3">
                {analyticsData.topAttendees.map((student, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-xs font-medium text-green-700">
                        {student.avatar}
                      </div>
                      <span className="ml-3 text-sm font-medium text-gray-900">{student.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-green-600">{student.attendance}%</span>
                      <Star className="w-4 h-4 text-yellow-400 ml-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* At Risk Students */}
            <div className="bg-red-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-4">At Risk Students</h5>
              <div className="space-y-3">
                {analyticsData.lowAttendees.map((student, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-xs font-medium text-red-700">
                        {student.avatar}
                      </div>
                      <span className="ml-3 text-sm font-medium text-gray-900">{student.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-red-600">{student.attendance}%</span>
                      <AlertCircle className="w-4 h-4 text-red-400 ml-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-4">Quick Actions</h5>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm bg-white rounded-md hover:bg-gray-100 flex items-center">
                  <Download className="w-4 h-4 mr-2 text-blue-600" />
                  Export Attendance Report
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-white rounded-md hover:bg-gray-100 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2 text-green-600" />
                  Send Reminder to Low Attendance
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-white rounded-md hover:bg-gray-100 flex items-center">
                  <PieChart className="w-4 h-4 mr-2 text-purple-600" />
                  Generate Detailed Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
};

// File Manager Modal Component
const FileManagerModal = ({ group, classData, onClose, onFilesUpdated }) => {
  const [files, setFiles] = useState(classData.files || []);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (uploadedFiles) => {
    setUploading(true);
    
    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newFiles = Array.from(uploadedFiles).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
      uploadedAt: new Date().toISOString().split('T')[0],
      downloads: 0,
      type: file.type
    }));

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesUpdated(group._id, classData._id, updatedFiles);
    setUploading(false);
  };

  const handleDelete = (fileId) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
    onFilesUpdated(group._id, classData._id, updatedFiles);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-0 border w-11/12 max-w-4xl shadow-lg rounded-lg bg-white">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-lg font-medium text-gray-900">File Manager</h3>
            <p className="text-sm text-gray-500 mt-1">{classData.subject} - {group.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Upload Area */}
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Course Materials</h4>
            <p className="text-gray-600 mb-4">Drag and drop files here, or click to browse</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Choose Files
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
            />
          </div>

          {/* Files List */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h5 className="font-medium text-gray-900">Course Materials ({files.length})</h5>
              <div className="text-sm text-gray-500">
                Total: {files.reduce((total, file) => total + parseFloat(file.size), 0).toFixed(1)} MB
              </div>
            </div>

            {files.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No files uploaded yet</p>
                <p className="text-sm text-gray-500 mt-1">Upload notes, assignments, and other course materials</p>
              </div>
            ) : (
              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                    <div className="flex items-center flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span>{file.size}</span>
                          <span>Uploaded: {file.uploadedAt}</span>
                          <span>{file.downloads} downloads</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 rounded">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-purple-600 rounded">
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(file.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* File Categories */}
          <div className="mt-6">
            <h5 className="font-medium text-gray-900 mb-3">Quick Upload Categories</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button className="p-3 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors">
                <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <span className="text-sm text-blue-700">Lecture Notes</span>
              </button>
              <button className="p-3 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
                <FileText className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <span className="text-sm text-green-700">Assignments</span>
              </button>
              <button className="p-3 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors">
                <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <span className="text-sm text-purple-700">Syllabus</span>
              </button>
              <button className="p-3 bg-orange-50 rounded-lg text-center hover:bg-orange-100 transition-colors">
                <Activity className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                <span className="text-sm text-orange-700">Lab Manuals</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Create Group Modal Component (keeping existing)
const CreateGroupModal = ({ onClose, onGroupCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    settings: {
      joinPermissions: 'college-only',
      allowBroadcast: true,
      autoApprove: true
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newGroup = {
        _id: Date.now().toString(),
        ...formData,
        groupCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        classes: [],
        totalStudents: 0,
        createdAt: new Date().toISOString()
      };

      onGroupCreated(newGroup);
    } catch (error) {
      setError('Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-lg shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Create New Class Group</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Group Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., TY.IT, SY.CS, FY.BCA"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of the class group..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Group'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Manage Group Modal Component (keeping existing but making settings interactive)
const ManageGroupModal = ({ group, onClose, onGroupUpdated }) => {
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState(group.classes);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [settings, setSettings] = useState(group.settings);
  const [groupData, setGroupData] = useState(group);

  const tabs = [
    { id: 'classes', name: 'Subjects', icon: BookOpen },
    { id: 'students', name: 'Students', icon: Users },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'broadcast', name: 'Broadcast', icon: MessageSquare }
  ];

  const handleAddSubject = () => {
    if (newSubject.trim()) {
      const newClass = {
        _id: Date.now().toString(),
        subject: newSubject.trim(),
        studentCount: 0,
        schedule: { days: [], startTime: '', endTime: '', room: '' },
        lastSession: null,
        attendanceRate: 0,
        isActive: true,
        activeLecture: null,
        files: []
      };
      setClasses([...classes, newClass]);
      setNewSubject('');
      setShowAddSubject(false);
    }
  };

  const handleRemoveSubject = (classId) => {
    setClasses(classes.filter(cls => cls._id !== classId));
  };

  const handleSettingsChange = (setting, value) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  const copyGroupCode = (groupCode) => {
    navigator.clipboard.writeText(groupCode);
    alert('Group code copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-0 border w-11/12 max-w-4xl shadow-lg rounded-lg bg-white">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Manage {group.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{group.description}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'classes' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium text-gray-900">Subjects in {group.name}</h4>
                <button
                  onClick={() => setShowAddSubject(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subject
                </button>
              </div>

              {showAddSubject && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="Enter subject name..."
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
                    />
                    <button
                      onClick={handleAddSubject}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddSubject(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {classes.map((cls) => (
                  <div key={cls._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{cls.subject}</h5>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>{cls.studentCount} students</span>
                        {cls.schedule.room && <span>{cls.schedule.room}</span>}
                        {cls.attendanceRate > 0 && <span>{cls.attendanceRate}% attendance</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 rounded">
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 rounded">
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleRemoveSubject(cls._id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium text-gray-900">Students in {group.name}</h4>
                <div className="flex space-x-2">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <Users className="w-4 h-4 mr-2" />
                    Export List
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No students yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Students will appear here once they join using the group code: <strong>{group.groupCode}</strong>
                </p>
                <button
                  onClick={() => copyGroupCode(group.groupCode)}
                  className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Group Code
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Group Settings</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Group Code</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={groupData.groupCode}
                        readOnly
                        className="block w-32 border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                      />
                      <button
                        onClick={() => copyGroupCode(groupData.groupCode)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button className="px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                        Regenerate
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Join Permissions</label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="college-only-edit"
                          name="joinPermissions"
                          checked={settings.joinPermissions === 'college-only'}
                          onChange={() => handleSettingsChange('joinPermissions', 'college-only')}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="college-only-edit" className="ml-3 text-sm text-gray-700 flex items-center">
                          <Shield className="w-4 h-4 mr-2 text-blue-600" />
                          College Only - Location verification required
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="anywhere-edit"
                          name="joinPermissions"
                          checked={settings.joinPermissions === 'anywhere'}
                          onChange={() => handleSettingsChange('joinPermissions', 'anywhere')}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="anywhere-edit" className="ml-3 text-sm text-gray-700 flex items-center">
                          <Globe className="w-4 h-4 mr-2 text-green-600" />
                          Anywhere - No location restrictions
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label htmlFor="allowBroadcast-edit" className="text-sm text-gray-700 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2 text-purple-600" />
                        Enable broadcast messaging
                      </label>
                      <button
                        onClick={() => handleSettingsChange('allowBroadcast', !settings.allowBroadcast)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.allowBroadcast ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.allowBroadcast ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label htmlFor="autoApprove-edit" className="text-sm text-gray-700 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Auto-approve join requests
                      </label>
                      <button
                        onClick={() => handleSettingsChange('autoApprove', !settings.autoApprove)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.autoApprove ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.autoApprove ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700 flex items-center">
                        <Bell className="w-4 h-4 mr-2 text-yellow-600" />
                        Send attendance reminders
                      </label>
                      <button
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-gray-200"
                      >
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700 flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-red-600" />
                        Require location verification
                      </label>
                      <button
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-blue-600"
                      >
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                      </button>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Group Description</label>
                    <textarea
                      value={groupData.description}
                      onChange={(e) => setGroupData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Danger Zone</h5>
                <button className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Group
                </button>
              </div>
            </div>
          )}

          {activeTab === 'broadcast' && (
            <div>
              <div className="mb-4">
                <h4 className="text-md font-medium text-gray-900">Broadcast Message</h4>
                <p className="text-sm text-gray-500 mt-1">Send announcements to all students in {group.name}</p>
              </div>

              {settings.allowBroadcast ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
                    <select className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option>General Announcement</option>
                      <option>Class Schedule Change</option>
                      <option>Assignment Reminder</option>
                      <option>Exam Notice</option>
                      <option>Emergency Alert</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <input
                      type="text"
                      placeholder="Message subject..."
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                      rows={4}
                      placeholder="Type your message here..."
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="urgent"
                        className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <label htmlFor="urgent" className="ml-2 text-sm text-gray-700">
                        Mark as urgent
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="sms"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="sms" className="ml-2 text-sm text-gray-700">
                        Send SMS notification
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-700">
                        Will be sent to {group.totalStudents} students
                      </span>
                    </div>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </button>
                  </div>

                  {/* Recent Messages */}
                  <div className="mt-6">
                    <h5 className="font-medium text-gray-900 mb-3">Recent Messages</h5>
                    <div className="space-y-2">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Assignment Deadline Reminder</p>
                            <p className="text-xs text-gray-600 mt-1">Please submit your DSA assignment by tomorrow 11:59 PM.</p>
                          </div>
                          <span className="text-xs text-gray-500">2 hours ago</span>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Class Postponed</p>
                            <p className="text-xs text-gray-600 mt-1">Tomorrow's DBMS class is postponed to Friday same time.</p>
                          </div>
                          <span className="text-xs text-gray-500">1 day ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <MessageSquare className="mx-auto h-8 w-8 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Broadcasting Disabled</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Enable broadcast messaging in group settings to send announcements.
                  </p>
                  <button 
                    onClick={() => {
                      setActiveTab('settings');
                      handleSettingsChange('allowBroadcast', true);
                    }}
                    className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                  >
                    Enable Broadcasting
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={() => {
              const updatedGroup = { ...groupData, classes, settings };
              onGroupUpdated(updatedGroup);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeachersDashboard;