import React, { useState, useEffect, useRef } from 'react';
import { Plus, Play, X, Loader, MapPin, Clock, Download, Users, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../services/api';
import DashboardLayout from './Dashboard/DashboardLayout';
import DashboardOverview from './Dashboard/DashboardOverview';
import ClassesPage from './Dashboard/ClassesPage';
import SubjectsPage from './Dashboard/SubjectsPage';
import LecturesPage from './Dashboard/LecturesPage';

const TeacherDashboard = ({ user: propUser, onLogout }) => {
  const { user: ctxUser } = useAuth();
  const effectiveUser = propUser || ctxUser;
  
  // State management
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [activeSessions, setActiveSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [liveAttendance, setLiveAttendance] = useState([]);
  
  // Form states
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [lectureName, setLectureName] = useState('');
  const [lectureDescription, setLectureDescription] = useState('');
  const [lectureDuration, setLectureDuration] = useState(60);
  
  // UI states
  const [showAddLecture, setShowAddLecture] = useState(false);
  const [showLectureManager, setShowLectureManager] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  
  // Dashboard navigation
  const [currentPage, setCurrentPage] = useState('overview');
  const [navigationStack, setNavigationStack] = useState([]);
  
  // Session creation states
  const [sessionSubject, setSessionSubject] = useState('');
  const [sessionLocation, setSessionLocation] = useState('college');
  const [sessionDuration, setSessionDuration] = useState(60);
  const [allowedLocation, setAllowedLocation] = useState({ lat: null, lng: null, radius: 100 });
  const [currentLocation, setCurrentLocation] = useState(null);
  
  // Token refresh
  const tokenRefreshInterval = useRef(null);

  useEffect(() => {
    if (effectiveUser && effectiveUser.role === 'teacher') {
      fetchClasses();
    }
  }, [effectiveUser]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('qroll_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Navigation handlers
  const navigateToPage = (page, data = null) => {
    setNavigationStack(prev => [...prev, { page: currentPage, data: { selectedClass, selectedSubject } }]);
    setCurrentPage(page);
    if (data) {
      if (data.selectedClass) setSelectedClass(data.selectedClass);
      if (data.selectedSubject) setSelectedSubject(data.selectedSubject);
    }
  };

  const navigateBack = () => {
    if (navigationStack.length > 0) {
      const previous = navigationStack[navigationStack.length - 1];
      setNavigationStack(prev => prev.slice(0, -1));
      setCurrentPage(previous.page);
      if (previous.data) {
        if (previous.data.selectedClass) setSelectedClass(previous.data.selectedClass);
        if (previous.data.selectedSubject) setSelectedSubject(previous.data.selectedSubject);
      }
    }
  };

  // Helper functions
  const showMessage = (msg, type = 'info') => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(''), 3000);
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/classes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      } else {
        showMessage('Failed to fetch classes', 'error');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      showMessage('Error fetching classes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    if (!selectedLecture || !selectedSubject) {
      showMessage('Please select a lecture first', 'error');
      return;
    }

    setLoading(true);
    try {
      const sessionData = {
        classId: selectedClass._id,
        subjectCode: selectedSubject.code,
        subjectName: selectedSubject.name,
        lectureId: selectedLecture._id || selectedLecture.title,
        lectureName: selectedLecture.title,
        duration: sessionDuration,
        location: sessionLocation === 'college' ? allowedLocation : null
      };

      const response = await fetch(`${API_BASE_URL}/sessions/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(sessionData)
      });

      const data = await response.json();
      if (data.success) {
        setSelectedSession(data.session);
        setShowCreateSession(false);
        showMessage('Session started successfully!', 'success');
        startTokenRefresh(data.session._id);
      } else {
        showMessage(data.message || 'Failed to create session', 'error');
      }
    } catch (error) {
      showMessage('Failed to create session', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Token refresh mechanism
  const startTokenRefresh = (sessionId) => {
    if (tokenRefreshInterval.current) {
      clearInterval(tokenRefreshInterval.current);
    }
    
    tokenRefreshInterval.current = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/refresh-token`, {
          method: 'POST',
          headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
          setSelectedSession(prev => ({
            ...prev,
            qrToken: data.qrToken,
            qrCodeUrl: data.qrCodeUrl
          }));
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }, 5000); // Refresh every 5 seconds
  };

  // Fetch live attendance
  const fetchLiveAttendance = async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/attendance`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setLiveAttendance(data.attendance);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  };

  // Export session report
  const exportSessionReport = async (sessionId, format = 'csv') => {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/export?format=${format}`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `session-report-${sessionId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showMessage(`Report exported as ${format.toUpperCase()}`);
      }
    } catch (error) {
      showMessage('Export failed', 'error');
    }
  };

  // Export attendance
  const exportAttendance = async (sessionId, format = 'csv') => {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/export?format=${format}`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-${sessionId}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
        showMessage(`Attendance exported as ${format.toUpperCase()}`, 'success');
      }
    } catch (error) {
      showMessage('Export failed', 'error');
    }
  };

  // Dashboard page handlers
  const handleCreateClass = async (classData) => {
    if (!classData.name.trim()) {
      showMessage('Class name is required', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/classes/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(classData)
      });

      const data = await response.json();
      if (data.success) {
        showMessage('Class created successfully!', 'success');
        await fetchClasses();
      } else {
        showMessage(data.message || 'Failed to create class', 'error');
      }
    } catch (error) {
      showMessage('Failed to create class', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (subjectData) => {
    if (!selectedClass) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/classes/${selectedClass._id}/subjects`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(subjectData)
      });

      const data = await response.json();
      if (data.success) {
        showMessage('Subject added successfully!', 'success');
        setSelectedClass(data.class);
        // Update classes list
        setClasses(prev => prev.map(cls => 
          cls._id === selectedClass._id ? data.class : cls
        ));
      } else {
        showMessage(data.message || 'Failed to add subject', 'error');
      }
    } catch (error) {
      showMessage('Failed to add subject', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLecture = async (lectureData) => {
    if (!selectedClass || !selectedSubject) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/classes/${selectedClass._id}/subjects/${selectedSubject.code}/lectures`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(lectureData)
      });

      const data = await response.json();
      if (data.success) {
        showMessage('Lecture added successfully!', 'success');
        setSelectedClass(data.class);
        // Update selected subject with new lectures
        const updatedSubject = data.class.subjects.find(s => s.code === selectedSubject.code);
        setSelectedSubject(updatedSubject);
        // Update classes list
        setClasses(prev => prev.map(cls => 
          cls._id === selectedClass._id ? data.class : cls
        ));
      } else {
        showMessage(data.message || 'Failed to add lecture', 'error');
      }
    } catch (error) {
      showMessage('Failed to add lecture', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (subject, lecture = null) => {
    if (lecture) {
      setSelectedLecture(lecture);
      setSessionDuration(lecture.duration || 60);
    }
    setSelectedSubject(subject);
    setShowCreateSession(true);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tokenRefreshInterval.current) {
        clearInterval(tokenRefreshInterval.current);
      }
    };
  }, []);

  // Live attendance polling
  useEffect(() => {
    if (selectedSession) {
      const interval = setInterval(() => {
        fetchLiveAttendance(selectedSession._id);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [selectedSession]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'overview':
        return (
          <DashboardOverview 
            classes={classes}
            onNavigateToClasses={() => navigateToPage('classes')}
            user={effectiveUser}
          />
        );
      case 'classes':
        return (
          <ClassesPage 
            classes={classes}
            onCreateClass={handleCreateClass}
            onSelectClass={(cls) => {
              setSelectedClass(cls);
              navigateToPage('subjects', { selectedClass: cls });
            }}
            loading={loading}
          />
        );
      case 'subjects':
        return (
          <SubjectsPage 
            selectedClass={selectedClass}
            onBack={() => navigateBack()}
            onAddSubject={handleAddSubject}
            onManageLectures={(subject) => {
              setSelectedSubject(subject);
              navigateToPage('lectures', { selectedSubject: subject });
            }}
            onStartSession={handleStartSession}
            loading={loading}
          />
        );
      case 'lectures':
        return (
          <LecturesPage 
            selectedSubject={selectedSubject}
            onBack={() => navigateBack()}
            onAddLecture={handleAddLecture}
            onStartSession={handleStartSession}
            loading={loading}
          />
        );
      default:
        return (
          <DashboardOverview 
            classes={classes}
            onNavigateToClasses={() => navigateToPage('classes')}
            user={effectiveUser}
          />
        );
    }
  };

  if (!effectiveUser || effectiveUser.role !== 'teacher') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need to be logged in as a teacher to access this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      user={effectiveUser}
      onLogout={onLogout}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    >
      {/* Message Toast */}
      {message && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`p-4 rounded-lg shadow-lg ${
            message.type === 'error' ? 'bg-red-100 text-red-800' : 
            message.type === 'success' ? 'bg-green-100 text-green-800' : 
            'bg-blue-100 text-blue-800'
          }`}>
            {typeof message === 'string' ? message : message.text}
          </div>
        </div>
      )}

      {renderCurrentPage()}

      {/* Session Creation Modal */}
      {showCreateSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Start Session</h3>
              <button
                onClick={() => {
                  setShowCreateSession(false);
                  setSelectedLecture(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Selected Lecture Display */}
              {selectedLecture && (
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-purple-900">{selectedLecture.title}</p>
                  <p className="text-xs text-purple-600">{selectedSubject?.name} ({selectedSubject?.code})</p>
                </div>
              )}

              {/* Location Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location Restriction
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="location"
                      value="anywhere"
                      checked={sessionLocation === 'anywhere'}
                      onChange={(e) => setSessionLocation(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Allow from anywhere</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="location"
                      value="college"
                      checked={sessionLocation === 'college'}
                      onChange={(e) => setSessionLocation(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Restrict to current location</span>
                  </label>
                </div>

                {sessionLocation === 'college' && (
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              setCurrentLocation({
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                              });
                              setAllowedLocation(prev => ({
                                ...prev,
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                              }));
                            },
                            (error) => showMessage('Failed to get location', 'error')
                          );
                        }
                      }}
                      className="w-full p-2 bg-blue-600 text-white rounded text-sm"
                    >
                      Get Current Location
                    </button>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Allowed radius: {allowedLocation.radius}m
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="500"
                        value={allowedLocation.radius}
                        onChange={(e) => setAllowedLocation(prev => ({
                          ...prev,
                          radius: parseInt(e.target.value)
                        }))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>50m</span>
                        <span>500m</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Duration Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Session Duration
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[30, 60, 90].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setSessionDuration(duration)}
                      className={`p-2 rounded text-sm ${
                        sessionDuration === duration
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {duration}min
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="15"
                    max="180"
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(parseInt(e.target.value))}
                    className="flex-1 p-2 border rounded text-sm"
                    placeholder="Custom duration"
                  />
                  <span className="text-sm text-gray-500">minutes</span>
                </div>
              </div>

              {/* Current Location Display */}
              {currentLocation && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">Current Location Set</p>
                  <p className="text-xs text-green-600">
                    Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
                  </p>
                </div>
              )}

              <button
                onClick={createSession}
                disabled={loading || !selectedLecture}
                className="w-full p-3 bg-purple-600 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Start Session
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TeacherDashboard;
