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
  Shield
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

  // State for class groups (new system)
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
          isActive: true
        },
        {
          _id: "c2", 
          subject: "Database Management Systems",
          studentCount: 42,
          schedule: { days: ["Tuesday", "Thursday"], startTime: "11:00", endTime: "12:30", room: "Room 201" },
          lastSession: "2024-08-21",
          attendanceRate: 92,
          isActive: true
        },
        {
          _id: "c3",
          subject: "Software Engineering",
          studentCount: 40,
          schedule: { days: ["Monday", "Friday"], startTime: "14:00", endTime: "15:30", room: "Room 301" },
          lastSession: "2024-08-20",
          attendanceRate: 88,
          isActive: true
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
          _id: "c4",
          subject: "Web Development",
          studentCount: 38,
          schedule: { days: ["Monday", "Wednesday"], startTime: "14:00", endTime: "15:30", room: "Lab 2" },
          lastSession: "2024-08-22",
          attendanceRate: 85,
          isActive: true
        },
        {
          _id: "c5",
          subject: "Object Oriented Programming",
          studentCount: 35,
          schedule: { days: ["Tuesday", "Thursday"], startTime: "10:00", endTime: "11:30", room: "Lab 3" },
          lastSession: "2024-08-21",
          attendanceRate: 91,
          isActive: true
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
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <button className="p-1 text-gray-400 hover:text-blue-600 rounded">
                                      <QrCode className="h-4 w-4" />
                                    </button>
                                    <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
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

// Manage Group Modal Component
const ManageGroupModal = ({ group, onClose, onGroupUpdated }) => {
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState(group.classes);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState('');

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
        isActive: true
      };
      setClasses([...classes, newClass]);
      setNewSubject('');
      setShowAddSubject(false);
    }
  };

  const handleRemoveSubject = (classId) => {
    setClasses(classes.filter(cls => cls._id !== classId));
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
                          checked={group.settings.joinPermissions === 'college-only'}
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
                          checked={group.settings.joinPermissions === 'anywhere'}
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
                        checked={group.settings.allowBroadcast}
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
                        checked={group.settings.autoApprove}
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

              {group.settings.allowBroadcast ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
                    <select className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option>General Announcement</option>
                      <option>Class Schedule Change</option>
                      <option>Assignment Reminder</option>
                      <option>Exam Notice</option>
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

                  <div className="flex items-center space-x-3">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
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
              const updatedGroup = { ...group, classes };
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