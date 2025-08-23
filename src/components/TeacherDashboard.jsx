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
  Copy,
  Eye
} from 'lucide-react';

const TeacherDashboard = ({ user, onLogout }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);

  // Fetch teacher's classes
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('qroll_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/classes/my-classes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setClasses(data.classes);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Fetch classes error:', error);
      setError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = () => {
    setShowCreateForm(true);
  };

  const handleClassCreated = (newClass) => {
    setClasses([newClass, ...classes]);
    setShowCreateForm(false);
  };

  const copyClassCode = (classCode) => {
    navigator.clipboard.writeText(classCode);
    // You could add a toast notification here
    alert(`Class code ${classCode} copied to clipboard!`);
  };

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.classCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Qroll</h1>
              </div>
              <nav className="hidden md:ml-8 md:flex space-x-8">
                <a href="#" className="text-blue-600 border-b-2 border-blue-600 px-1 pb-2 text-sm font-medium">
                  Dashboard
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 px-1 pb-2 text-sm font-medium">
                  Analytics
                </a>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img
                  className="h-8 w-8 rounded-full"
                  src={user.profilePicture}
                  alt={user.name}
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-700">{user.name}</p>
                  <p className="text-xs text-gray-500">Teacher</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h2>
            <p className="text-gray-600 mt-2">Manage your classes and track attendance</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Classes</dt>
                    <dd className="text-2xl font-bold text-gray-900">{classes.length}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {classes.reduce((total, cls) => total + cls.studentCount, 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Sessions</dt>
                    <dd className="text-2xl font-bold text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Attendance</dt>
                    <dd className="text-2xl font-bold text-gray-900">--</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Classes Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">My Classes</h3>
                <button
                  onClick={handleCreateClass}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Class
                </button>
              </div>
              
              {/* Search and Filter */}
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search classes..."
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

            {/* Classes List */}
            <div className="divide-y divide-gray-200">
              {filteredClasses.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No classes found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {classes.length === 0 
                      ? "Get started by creating your first class."
                      : "Try adjusting your search terms."
                    }
                  </p>
                  {classes.length === 0 && (
                    <div className="mt-6">
                      <button
                        onClick={handleCreateClass}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Class
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                filteredClasses.map((cls) => (
                  <div key={cls._id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {cls.name}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <p className="text-sm text-gray-500">{cls.subject}</p>
                              <span className="text-gray-300">•</span>
                              <p className="text-sm text-gray-500">{cls.studentCount} students</p>
                              <span className="text-gray-300">•</span>
                              <button
                                onClick={() => copyClassCode(cls.classCode)}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Code: {cls.classCode}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {cls.description && (
                      <div className="mt-2 ml-13">
                        <p className="text-sm text-gray-600">{cls.description}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Create Class Modal */}
      {showCreateForm && (
        <CreateClassModal
          onClose={() => setShowCreateForm(false)}
          onClassCreated={handleClassCreated}
        />
      )}
    </div>
  );
};

// Create Class Modal Component
const CreateClassModal = ({ onClose, onClassCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: '',
    schedule: {
      days: [],
      startTime: '',
      endTime: '',
      room: ''
    },
    settings: {
      allowLateJoin: true,
      maxStudents: '',
      requireApproval: false
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('qroll_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/classes/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          settings: {
            ...formData.settings,
            maxStudents: formData.settings.maxStudents ? parseInt(formData.settings.maxStudents) : null
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        onClassCreated(data.class);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Create class error:', error);
      setError('Failed to create class. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: prev.schedule.days.includes(day)
          ? prev.schedule.days.filter(d => d !== day)
          : [...prev.schedule.days, day]
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Create New Class</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Basic Information</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Class Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Advanced Mathematics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Subject *</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Mathematics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of the class..."
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Schedule (Optional)</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Days of Week</label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-3 py-1 text-sm rounded-full border ${
                      formData.schedule.days.includes(day)
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-100 border-gray-300 text-gray-700'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="time"
                  value={formData.schedule.startTime}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    schedule: { ...prev.schedule, startTime: e.target.value }
                  }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="time"
                  value={formData.schedule.endTime}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    schedule: { ...prev.schedule, endTime: e.target.value }
                  }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Room/Location</label>
              <input
                type="text"
                value={formData.schedule.room}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  schedule: { ...prev.schedule, room: e.target.value }
                }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Room 101, Online"
              />
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Class Settings</h4>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowLateJoin"
                  checked={formData.settings.allowLateJoin}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, allowLateJoin: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="allowLateJoin" className="ml-2 text-sm text-gray-700">
                  Allow students to join after class starts
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireApproval"
                  checked={formData.settings.requireApproval}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, requireApproval: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="requireApproval" className="ml-2 text-sm text-gray-700">
                  Require approval for new students
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Maximum Students</label>
                <input
                  type="number"
                  min="1"
                  value={formData.settings.maxStudents}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, maxStudents: e.target.value }
                  }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherDashboard; 