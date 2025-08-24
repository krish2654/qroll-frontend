import React, { useState, useEffect } from 'react';
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
  Pause,
  Download,
  Upload,
  FileText,
  Image,
  Video,
  Link,
  Eye,
  Calendar as CalendarIcon,
  Monitor
} from 'lucide-react';

const TeachersDashboard = () => {
  // Mock user data - would come from props in real app
  const [user] = useState({
    name: "Dr. Sarah Wilson",
    email: "sarah.wilson@college.edu",
    profilePicture: "https://ui-avatars.com/api/?name=Sarah+Wilson&background=3b82f6&color=fff",
    role: "teacher",
    department: "Computer Science"
  });

  // State for class groups with lectures
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
          lectures: [
            {
              _id: "l1",
              title: "Introduction to Trees",
              date: "2024-08-23",
              startTime: "09:00",
              endTime: "10:30",
              isActive: true,
              qrCode: "QR_DSA_TREES_20240823",
              attendees: 42,
              files: [
                { name: "Trees_Notes.pdf", type: "pdf", size: "2.4 MB", uploadedAt: "2024-08-22" },
                { name: "Tree_Examples.jpg", type: "image", size: "1.2 MB", uploadedAt: "2024-08-22" }
              ]
            },
            {
              _id: "l2",
              title: "Binary Search Trees",
              date: "2024-08-21",
              startTime: "09:00",
              endTime: "10:30",
              isActive: false,
              qrCode: "QR_DSA_BST_20240821",
              attendees: 40,
              files: [
                { name: "BST_Implementation.cpp", type: "code", size: "856 bytes", uploadedAt: "2024-08-21" }
              ]
            }
          ],
          totalLectures: 15,
          completedLectures: 2
        },
        {
          _id: "c2", 
          subject: "Database Management Systems",
          studentCount: 42,
          schedule: { days: ["Tuesday", "Thursday"], startTime: "11:00", endTime: "12:30", room: "Room 201" },
          lastSession: "2024-08-21",
          attendanceRate: 92,
          isActive: true,
          lectures: [
            {
              _id: "l3",
              title: "SQL Queries",
              date: "2024-08-22",
              startTime: "11:00",
              endTime: "12:30",
              isActive: false,
              qrCode: "QR_DBMS_SQL_20240822",
              attendees: 39,
              files: [
                { name: "SQL_Queries.sql", type: "code", size: "1.1 KB", uploadedAt: "2024-08-22" },
                { name: "Database_Schema.png", type: "image", size: "890 KB", uploadedAt: "2024-08-22" }
              ]
            }
          ],
          totalLectures: 12,
          completedLectures: 1
        }
      ],
      settings: {
        joinPermissions: "college-only",
        allowBroadcast: true,
        autoApprove: true
      },
      totalStudents: 45,
      createdAt: "2024-08-01"
    },
    {
      _id: "2",
      name: "SY.IT", 
      description: "Second Year Information Technology",
      groupCode: "SYIT24",
      classes: [
        {
          _id: "c3",
          subject: "Web Development",
          studentCount: 38,
          schedule: { days: ["Monday", "Wednesday"], startTime: "14:00", endTime: "15:30", room: "Lab 2" },
          lastSession: "2024-08-22",
          attendanceRate: 85,
          isActive: true,
          lectures: [],
          totalLectures: 10,
          completedLectures: 0
        }
      ],
      settings: {
        joinPermissions: "anywhere",
        allowBroadcast: true, 
        autoApprove: false
      },
      totalStudents: 38,
      createdAt: "2024-07-15"
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateGroupForm, setShowCreateGroupForm] = useState(false);
  const [showManageGroup, setShowManageGroup] = useState(null);
  const [showSubjectDetails, setShowSubjectDetails] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "45 students joined TY.IT group", time: "2 hours ago", type: "info" },
    { id: 2, message: "Web Development class starts in 30 mins", time: "30 mins ago", type: "warning" }
  ]);

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

  const generateQRCode = (lectureId, subject) => {
    // In real app, this would generate actual QR code and return join URL
    const joinUrl = `https://qroll.duckdns.org/join-lecture/${lectureId}`;
    return joinUrl;
  };

  const handleLogout = () => {
    console.log("Logging out...");
  };

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
                  <p className="text-xs text-gray-500">{user.department}</p>
                </div>
                <button
                  onClick={handleLogout}
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
            <p className="text-gray-600 mt-2">Manage your class groups and track attendance across multiple subjects</p>
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
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <h5 className="text-sm font-medium text-gray-900 truncate">{cls.subject}</h5>
                                    <div className="flex items-center space-x-3 mt-1">
                                      <span className="text-xs text-gray-500">{cls.studentCount} students</span>
                                      <span className="text-xs text-gray-500">
                                        {cls.attendanceRate}% attendance
                                      </span>
                                      {cls.schedule.room && (
                                        <span className="text-xs text-gray-500">{cls.schedule.room}</span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className="text-xs text-blue-600">
                                        {cls.completedLectures || 0}/{cls.totalLectures || 0} lectures
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <button 
                                      onClick={() => setShowSubjectDetails({...cls, groupId: group._id, groupName: group.name})}
                                      className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                      title="Manage Lectures"
                                    >
                                      <Calendar className="h-4 w-4" />
                                    </button>
                                    <button 
                                      onClick={() => setShowSubjectDetails({...cls, groupId: group._id, groupName: group.name, showAnalytics: true})}
                                      className="p-1 text-gray-400 hover:text-green-600 rounded"
                                      title="View Analytics"
                                    >
                                      <BarChart3 className="h-4 w-4" />
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

      {/* Create Group Modal */}
      {showCreateGroupForm && (
        <CreateGroupModal
          onClose={() => setShowCreateGroupForm(false)}
          onGroupCreated={handleCreateGroup}
        />
      )}

      {/* Manage Group Modal */}
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
          copyGroupCode={copyGroupCode}
        />
      )}

      {/* Subject Details Modal */}
      {showSubjectDetails && (
        <SubjectDetailsModal
          subject={showSubjectDetails}
          onClose={() => setShowSubjectDetails(null)}
          onSubjectUpdated={(updatedSubject) => {
            setClassGroups(prev => prev.map(group => ({
              ...group,
              classes: group.classes.map(cls => 
                cls._id === updatedSubject._id ? updatedSubject : cls
              )
            })));
            setShowSubjectDetails(null);
          }}
          generateQRCode={generateQRCode}
        />
      )}
    </div>
  );
};

// Create Group Modal Component
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
      // Simulate API call
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Join Permissions</label>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="college-only"
                  name="joinPermissions"
                  value="college-only"
                  checked={formData.settings.joinPermissions === 'college-only'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, joinPermissions: e.target.value }
                  }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="college-only" className="ml-3 text-sm text-gray-700">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-blue-600" />
                    <div>
                      <div className="font-medium">College Only</div>
                      <div className="text-gray-500">Students must be within campus radius to join</div>
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="radio"
                  id="anywhere"
                  name="joinPermissions"
                  value="anywhere"
                  checked={formData.settings.joinPermissions === 'anywhere'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, joinPermissions: e.target.value }
                  }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="anywhere" className="ml-3 text-sm text-gray-700">
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-green-600" />
                    <div>
                      <div className="font-medium">Anywhere</div>
                      <div className="text-gray-500">Students can join from any location</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowBroadcast"
                checked={formData.settings.allowBroadcast}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  settings: { ...prev.settings, allowBroadcast: e.target.checked }
                }))}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="allowBroadcast" className="ml-2 text-sm text-gray-700">
                Enable broadcast messaging to all students
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoApprove"
                checked={formData.settings.autoApprove}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  settings: { ...prev.settings, autoApprove: e.target.checked }
                }))}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="autoApprove" className="ml-2 text-sm text-gray-700">
                Auto-approve student join requests
              </label>
            </div>
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

// Subject Details Modal with Lectures Management
const SubjectDetailsModal = ({ subject, onClose, onSubjectUpdated, generateQRCode }) => {
  const [activeTab, setActiveTab] = useState(subject.showAnalytics ? 'analytics' : 'lectures');
  const [lectures, setLectures] = useState(subject.lectures || []);
  const [showCreateLecture, setShowCreateLecture] = useState(false);
  const [showQRModal, setShowQRModal] = useState(null);
  const [activeLecture, setActiveLecture] = useState(null);

  const tabs = [
    { id: 'lectures', name: 'Lectures', icon: Calendar },
    { id: 'files', name: 'Files & Notes', icon: FileText },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 }
  ];

  const handleCreateLecture = (lectureData) => {
    const newLecture = {
      _id: Date.now().toString(),
      ...lectureData,
      qrCode: `QR_${subject.subject.replace(/\s+/g, '_').toUpperCase()}_${Date.now()}`,
      attendees: 0,
      files: [],
      isActive: false
    };
    
    setLectures([newLecture, ...lectures]);
    setShowCreateLecture(false);
  };

  const handleStartLecture = (lectureId) => {
    setLectures(prev => prev.map(lecture => ({
      ...lecture,
      isActive: lecture._id === lectureId ? true : false
    })));
    setActiveLecture(lectureId);
  };

  const handleStopLecture = (lectureId) => {
    setLectures(prev => prev.map(lecture => ({
      ...lecture,
      isActive: lecture._id === lectureId ? false : lecture.isActive
    })));
    setActiveLecture(null);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-0 border w-11/12 max-w-6xl shadow-lg rounded-lg bg-white">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{subject.subject}</h3>
            <p className="text-sm text-gray-500 mt-1">{subject.groupName} • {subject.studentCount} students</p>
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
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'lectures' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-md font-medium text-gray-900">Lectures</h4>
                <button
                  onClick={() => setShowCreateLecture(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Lecture
                </button>
              </div>

              {showCreateLecture && (
                <CreateLectureForm
                  onCancel={() => setShowCreateLecture(false)}
                  onSubmit={handleCreateLecture}
                />
              )}

              <div className="space-y-4">
                {lectures.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No lectures yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Create your first lecture to get started.</p>
                  </div>
                ) : (
                  lectures.map((lecture) => (
                    <div key={lecture._id} className={`p-4 rounded-lg border-2 ${
                      lecture.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h5 className="font-medium text-gray-900">{lecture.title}</h5>
                            {lecture.isActive && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                                Live
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span>{lecture.date}</span>
                            <span>{lecture.startTime} - {lecture.endTime}</span>
                            <span>{lecture.attendees} attended</span>
                            {lecture.files && lecture.files.length > 0 && (
                              <span>{lecture.files.length} files</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {lecture.isActive ? (
                            <button
                              onClick={() => handleStopLecture(lecture._id)}
                              className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                            >
                              <Pause className="w-4 h-4 mr-1" />
                              Stop
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartLecture(lecture._id)}
                              className="inline-flex items-center px-3 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100"
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Start
                            </button>
                          )}
                          
                          <button
                            onClick={() => setShowQRModal(lecture)}
                            className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                          >
                            <QrCode className="w-4 h-4 mr-1" />
                            QR Code
                          </button>
                          
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <FilesTab lectures={lectures} setLectures={setLectures} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab subject={subject} lectures={lectures} />
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
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <QRCodeModal
          lecture={showQRModal}
          subject={subject}
          onClose={() => setShowQRModal(null)}
          generateQRCode={generateQRCode}
        />
      )}
    </div>
  );
};

// Create Lecture Form Component
const CreateLectureForm = ({ onCancel, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:30'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h5 className="font-medium text-gray-900 mb-4">Create New Lecture</h5>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Lecture Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Introduction to Arrays"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Time *</label>
            <input
              type="time"
              required
              value={formData.startTime}
              onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Time *</label>
            <input
              type="time"
              required
              value={formData.endTime}
              onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Lecture
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// QR Code Modal Component
const QRCodeModal = ({ lecture, subject, onClose, generateQRCode }) => {
  const joinUrl = generateQRCode(lecture._id, subject.subject);
  
  const copyJoinUrl = () => {
    navigator.clipboard.writeText(joinUrl);
    alert('Join URL copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border w-11/12 max-w-md shadow-lg rounded-lg bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Lecture QR Code</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="text-center">
          <div className="mb-4">
            <h4 className="font-medium text-gray-900">{lecture.title}</h4>
            <p className="text-sm text-gray-500">{subject.subject}</p>
            <p className="text-sm text-gray-500">{lecture.date} • {lecture.startTime} - {lecture.endTime}</p>
          </div>

          {/* QR Code Placeholder */}
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
            <QrCode className="mx-auto h-24 w-24 text-gray-400 mb-4" />
            <p className="text-sm text-gray-500">QR Code for lecture attendance</p>
            <p className="text-xs text-gray-400 mt-2">Students scan this to join the lecture</p>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Join URL:</p>
              <p className="text-sm font-mono text-gray-700 break-all">{joinUrl}</p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={copyJoinUrl}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy URL
              </button>
              <button className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Download QR
              </button>
            </div>
          </div>

          {lecture.isActive && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-green-800">Lecture is Live</span>
              </div>
              <p className="text-xs text-green-600 mt-1">Students can scan QR code to mark attendance</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Files Tab Component
const FilesTab = ({ lectures, setLectures }) => {
  const [selectedLecture, setSelectedLecture] = useState(lectures[0]?._id || '');
  const [dragOver, setDragOver] = useState(false);

  const currentLecture = lectures.find(l => l._id === selectedLecture);
  const files = currentLecture?.files || [];

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    uploadedFiles.forEach(file => {
      const newFile = {
        name: file.name,
        type: getFileType(file.name),
        size: formatFileSize(file.size),
        uploadedAt: new Date().toISOString().split('T')[0]
      };
      
      setLectures(prev => prev.map(lecture => 
        lecture._id === selectedLecture
          ? { ...lecture, files: [...(lecture.files || []), newFile] }
          : lecture
      ));
    });
  };

  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['mp4', 'avi', 'mov'].includes(ext)) return 'video';
    if (['cpp', 'java', 'py', 'js'].includes(ext)) return 'code';
    return 'document';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5 text-green-600" />;
      case 'pdf': return <FileText className="w-5 h-5 text-red-600" />;
      case 'video': return <Video className="w-5 h-5 text-purple-600" />;
      case 'code': return <Monitor className="w-5 h-5 text-blue-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Lecture</label>
        <select
          value={selectedLecture}
          onChange={(e) => setSelectedLecture(e.target.value)}
          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {lectures.map(lecture => (
            <option key={lecture._id} value={lecture._id}>
              {lecture.title} - {lecture.date}
            </option>
          ))}
        </select>
      </div>

      {selectedLecture && (
        <div>
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center mb-6 transition-colors ${
              dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFileUpload(e);
            }}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Files</h3>
            <p className="text-gray-500 mb-4">Drag and drop files here, or click to select</p>
            <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
              <input
                type="file"
                multiple
                className="sr-only"
                onChange={handleFileUpload}
                accept=".pdf,.jpg,.jpeg,.png,.mp4,.cpp,.java,.py,.js,.txt,.doc,.docx,.ppt,.pptx"
              />
            </label>
          </div>

          {/* Files List */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Uploaded Files ({files.length})</h4>
            {files.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No files uploaded</h3>
                <p className="mt-1 text-sm text-gray-500">Upload notes, assignments, or other materials for this lecture.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.size} • Uploaded on {file.uploadedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-blue-600">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ subject, lectures }) => {
  const totalLectures = lectures.length;
  const completedLectures = lectures.filter(l => !l.isActive && l.attendees > 0).length;
  const avgAttendance = totalLectures > 0 
    ? Math.round(lectures.reduce((sum, l) => sum + (l.attendees || 0), 0) / totalLectures)
    : 0;
  const totalFiles = lectures.reduce((sum, l) => sum + (l.files?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Total Lectures</p>
              <p className="text-2xl font-bold text-blue-900">{totalLectures}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Completed</p>
              <p className="text-2xl font-bold text-green-900">{completedLectures}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-600">Avg Attendance</p>
              <p className="text-2xl font-bold text-purple-900">{avgAttendance}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-600">Total Files</p>
              <p className="text-2xl font-bold text-orange-900">{totalFiles}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Lectures */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Recent Lectures</h4>
        {lectures.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
            <p className="mt-1 text-sm text-gray-500">Create lectures to see analytics and attendance data.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lectures.slice(0, 5).map((lecture) => (
              <div key={lecture._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{lecture.title}</p>
                  <p className="text-sm text-gray-500">{lecture.date} • {lecture.startTime}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{lecture.attendees}/{subject.studentCount}</p>
                  <p className="text-xs text-gray-500">
                    {Math.round((lecture.attendees / subject.studentCount) * 100)}% attendance
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Manage Group Modal Component with Interactive Settings
const ManageGroupModal = ({ group, onClose, onGroupUpdated, copyGroupCode }) => {
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState(group.classes);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [settings, setSettings] = useState(group.settings);
  const [broadcastMessage, setBroadcastMessage] = useState({
    type: 'General Announcement',
    subject: '',
    message: ''
  });

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
        lectures: [],
        totalLectures: 0,
        completedLectures: 0
      };
      setClasses([...classes, newClass]);
      setNewSubject('');
      setShowAddSubject(false);
    }
  };

  const handleRemoveSubject = (classId) => {
    setClasses(classes.filter(cls => cls._id !== classId));
  };

  const handleSettingsUpdate = (newSettings) => {
    setSettings(newSettings);
  };

  const handleSendBroadcast = () => {
    if (broadcastMessage.subject.trim() && broadcastMessage.message.trim()) {
      // In real app, this would send API request
      alert(`Broadcast sent to ${group.totalStudents} students!`);
      setBroadcastMessage({
        type: 'General Announcement',
        subject: '',
        message: ''
      });
    }
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
                        <span>{cls.completedLectures || 0}/{cls.totalLectures || 0} lectures</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 rounded" title="Manage Lectures">
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 rounded" title="View Analytics">
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleRemoveSubject(cls._id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded"
                        title="Remove Subject"
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
                        value={group.groupCode}
                        readOnly
                        className="block w-32 border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                      />
                      <button
                        onClick={() => copyGroupCode(group.groupCode)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                      >
                        <Copy className="w-4 h-4" />
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
                          onChange={() => handleSettingsUpdate({...settings, joinPermissions: 'college-only'})}
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
                          onChange={() => handleSettingsUpdate({...settings, joinPermissions: 'anywhere'})}
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
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="allowBroadcast-edit"
                        checked={settings.allowBroadcast}
                        onChange={(e) => handleSettingsUpdate({...settings, allowBroadcast: e.target.checked})}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="allowBroadcast-edit" className="ml-2 text-sm text-gray-700">
                        Enable broadcast messaging
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoApprove-edit"
                        checked={settings.autoApprove}
                        onChange={(e) => handleSettingsUpdate({...settings, autoApprove: e.target.checked})}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="autoApprove-edit" className="ml-2 text-sm text-gray-700">
                        Auto-approve join requests
                      </label>
                    </div>
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
                    <select 
                      value={broadcastMessage.type}
                      onChange={(e) => setBroadcastMessage(prev => ({...prev, type: e.target.value}))}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option>General Announcement</option>
                      <option>Class Schedule Change</option>
                      <option>Assignment Reminder</option>
                      <option>Exam Notice</option>
                      <option>Holiday Notice</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <input
                      type="text"
                      value={broadcastMessage.subject}
                      onChange={(e) => setBroadcastMessage(prev => ({...prev, subject: e.target.value}))}
                      placeholder="Message subject..."
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                      rows={4}
                      value={broadcastMessage.message}
                      onChange={(e) => setBroadcastMessage(prev => ({...prev, message: e.target.value}))}
                      placeholder="Type your message here..."
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={handleSendBroadcast}
                      disabled={!broadcastMessage.subject.trim() || !broadcastMessage.message.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send to All Students
                    </button>
                    <span className="text-sm text-gray-500">Will be sent to {group.totalStudents} students</span>
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
                      handleSettingsUpdate({...settings, allowBroadcast: true});
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
              const updatedGroup = { ...group, classes, settings };
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