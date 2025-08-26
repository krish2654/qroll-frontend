import React, { useState, useEffect, useRef } from 'react';
import { Plus, Play, X, Loader, MapPin, Clock, Download, Users, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../services/api';

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

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/classes/my-classes`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const createClass = async () => {
    if (!className.trim()) {
      showMessage('Class name is required', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/classes/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: className.trim(),
          description: classDescription.trim() || undefined
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchClasses();
        setShowCreateClass(false);
        setClassName('');
        setClassDescription('');
        showMessage('Class created successfully!');
      } else {
        showMessage(data.message || 'Failed to create class', 'error');
      }
    } catch (error) {
      showMessage('Failed to create class', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addSubject = async () => {
    if (!subjectName.trim() || !subjectCode.trim()) {
      showMessage('Subject name and code are required', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/classes/${selectedClass._id}/subjects`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: subjectName.trim(),
          code: subjectCode.trim(),
          description: subjectDescription.trim() || undefined
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchClasses();
        setSelectedClass(data.class);
        setShowAddSubject(false);
        setSubjectName('');
        setSubjectCode('');
        setSubjectDescription('');
        showMessage('Subject added successfully!');
      } else {
        showMessage(data.message || 'Failed to add subject', 'error');
      }
    } catch (error) {
      showMessage('Failed to add subject', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Add lecture to subject
  const addLecture = async () => {
    if (!lectureName.trim()) {
      showMessage('Lecture title is required', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/classes/${selectedClass._id}/subjects/${selectedSubject.code}/lectures`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: lectureName.trim(),
          description: lectureDescription.trim() || undefined,
          duration: lectureDuration
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchClasses();
        setSelectedClass(data.class);
        setShowAddLecture(false);
        setLectureName('');
        setLectureDescription('');
        setLectureDuration(60);
        setSelectedSubject(null);
        showMessage('Lecture added successfully!');
      } else {
        showMessage(data.message || 'Failed to add lecture', 'error');
      }
    } catch (error) {
      showMessage('Failed to add lecture', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  // Create session with enhanced features
  const createSession = async () => {
    if (!sessionSubject.trim()) {
      showMessage('Please select a subject', 'error');
      return;
    }

    setLoading(true);
    try {
      let locationData = null;
      
      if (sessionLocation === 'college') {
        // Get current location for college-based sessions
        try {
          const location = await getCurrentLocation();
          locationData = {
            type: 'restricted',
            coordinates: location,
            radius: allowedLocation.radius
          };
          setCurrentLocation(location);
        } catch (error) {
          showMessage('Location access required for college sessions', 'error');
          setLoading(false);
          return;
        }
      } else {
        locationData = { type: 'anywhere' };
      }

      const response = await fetch(`${API_BASE_URL}/sessions/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          classId: selectedClass._id,
          subjectId: sessionSubject,
          duration: sessionDuration,
          location: locationData
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setActiveSessions([...activeSessions, data.session]);
        setSelectedSession(data.session);
        setShowCreateSession(false);
        showMessage('Session created successfully!');
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">QRoll</h1>
          <p className="text-gray-600">Teacher Dashboard</p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-lg text-sm">
            {message}
          </div>
        )}

        {/* Main Content */}
        {!selectedClass ? (
          <div className="space-y-4">
            {/* Create Class Button */}
            <button
              onClick={() => setShowCreateClass(true)}
              className="w-full p-4 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Create New Class
            </button>

            {/* Classes List */}
            <div className="space-y-3">
              {classes.map((cls) => (
                <div
                  key={cls._id}
                  onClick={() => setSelectedClass(cls)}
                  className="p-4 bg-white rounded-lg shadow border cursor-pointer hover:bg-gray-50"
                >
                  <h3 className="font-medium text-gray-900">{cls.name}</h3>
                  <p className="text-sm text-gray-600">Section {cls.section}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {cls.subjects?.length || 0} subjects
                  </p>
                </div>
              ))}
            </div>

            {classes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No classes yet. Create your first class!</p>
              </div>
            )}
          </div>
        ) : selectedSession ? (
          <div className="space-y-4">
            {/* Back Button */}
            <button
              onClick={() => {
                setSelectedSession(null);
                if (tokenRefreshInterval.current) {
                  clearInterval(tokenRefreshInterval.current);
                }
              }}
              className="text-blue-600 text-sm"
            >
              ← Back to Class
            </button>

            {/* Active Session Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-green-900">Active Session</h3>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-green-600 animate-spin" />
                  <span className="text-xs text-green-600">Live</span>
                </div>
              </div>
              <p className="text-sm text-green-800">
                Subject: {selectedSession.subjectName}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Duration: {selectedSession.duration} minutes
              </p>
            </div>

            {/* QR Code Display */}
            {selectedSession.qrCodeUrl && (
              <div className="bg-white rounded-lg p-6 text-center shadow">
                <h4 className="font-medium mb-4">Scan to Join Session</h4>
                <img 
                  src={selectedSession.qrCodeUrl} 
                  alt="Session QR Code"
                  className="mx-auto mb-4 w-48 h-48"
                />
                <p className="text-xs text-gray-500">
                  QR code refreshes every 5 seconds
                </p>
              </div>
            )}

            {/* Live Attendance */}
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Live Attendance ({liveAttendance.length})
                </h4>
                <button
                  onClick={() => fetchLiveAttendance(selectedSession._id)}
                  className="text-blue-600 text-sm"
                >
                  Refresh
                </button>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {liveAttendance.map((attendance, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{attendance.studentName}</p>
                      <p className="text-xs text-gray-500">{attendance.email}</p>
                    </div>
                    <span className="text-xs text-green-600">
                      {new Date(attendance.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
                
                {liveAttendance.length === 0 && (
                  <p className="text-center text-gray-500 py-4 text-sm">
                    No attendance yet
                  </p>
                )}
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white rounded-lg p-4 shadow">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={() => exportSessionReport(selectedSession._id, 'csv')}
                  className="flex-1 py-2 px-3 bg-green-600 text-white rounded text-sm"
                >
                  CSV
                </button>
                <button
                  onClick={() => exportSessionReport(selectedSession._id, 'pdf')}
                  className="flex-1 py-2 px-3 bg-red-600 text-white rounded text-sm"
                >
                  PDF
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Back Button */}
            <button
              onClick={() => setSelectedClass(null)}
              className="text-blue-600 text-sm"
            >
              ← Back to Classes
            </button>

            {/* Class Info */}
            <div className="p-4 bg-white rounded-lg shadow">
              <h2 className="font-bold text-gray-900">{selectedClass.name}</h2>
              {selectedClass.description && (
                <p className="text-gray-600 mt-1">{selectedClass.description}</p>
              )}
              <p className="text-xs text-blue-600 mt-2">
                {selectedClass.subjects?.length || 0} subjects
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowAddSubject(true)}
                className="p-3 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Subject
              </button>
              <button
                onClick={() => setShowCreateSession(true)}
                className="p-3 bg-purple-600 text-white rounded-lg flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start Session
              </button>
            </div>

            {/* Subjects List */}
            <div className="space-y-2">
              {selectedClass.subjects?.map((subject, index) => (
                <div key={index} className="p-3 bg-white rounded-lg shadow border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{subject.name}</h4>
                      <p className="text-sm text-gray-600">{subject.code}</p>
                      {subject.description && (
                        <p className="text-xs text-gray-500 mt-1">{subject.description}</p>
                      )}
                      <p className="text-xs text-blue-600 mt-1">
                        {subject.lectures?.length || 0} lectures
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedSubject(subject);
                          setShowLectureManager(true);
                        }}
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Lectures
                      </button>
                      <button
                        onClick={() => {
                          if (subject.lectures && subject.lectures.length > 0) {
                            setSelectedSubject(subject);
                            setSessionSubject(subject.code);
                            setShowCreateSession(true);
                          } else {
                            showMessage('Create lectures first to start sessions', 'error');
                          }
                        }}
                        disabled={loading}
                        className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                          subject.lectures && subject.lectures.length > 0
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-300 text-gray-500'
                        }`}
                      >
                        <Play className="w-3 h-3" />
                        Session
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {(!selectedClass.subjects || selectedClass.subjects.length === 0) && (
              <div className="text-center py-6 text-gray-500">
                <p>No subjects yet. Add a subject to start!</p>
              </div>
            )}
          </div>
        )}

        {/* Lecture Manager Modal */}
        {showLectureManager && selectedSubject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Manage Lectures</h3>
                <button onClick={() => {
                  setShowLectureManager(false);
                  setSelectedSubject(null);
                  setShowAddLecture(false);
                  setLectureName('');
                  setLectureDescription('');
                  setLectureDuration(60);
                }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">{selectedSubject.name}</p>
                <p className="text-xs text-blue-600">{selectedSubject.code}</p>
              </div>

              {/* Add New Lecture Button */}
              <button
                onClick={() => setShowAddLecture(true)}
                className="w-full mb-4 p-3 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Lecture
              </button>

              {/* Lectures List */}
              <div className="space-y-3">
                {selectedSubject.lectures && selectedSubject.lectures.length > 0 ? (
                  selectedSubject.lectures.map((lecture, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{lecture.title}</h4>
                          {lecture.description && (
                            <p className="text-sm text-gray-600 mt-1">{lecture.description}</p>
                          )}
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>Duration: {lecture.duration || 60} min</span>
                            {lecture.date && (
                              <span>Date: {new Date(lecture.date).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedLecture(lecture);
                            setSessionSubject(selectedSubject.code);
                            setShowCreateSession(true);
                          }}
                          className="ml-2 px-2 py-1 bg-blue-600 text-white rounded text-xs flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          Start
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p>No lectures yet. Create your first lecture!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Lecture Modal */}
        {showAddLecture && selectedSubject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Add Lecture</h3>
                <button onClick={() => {
                  setShowAddLecture(false);
                  setLectureName('');
                  setLectureDescription('');
                  setLectureDuration(60);
                }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">{selectedSubject.name}</p>
                <p className="text-xs text-blue-600">{selectedSubject.code}</p>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Lecture Title"
                  value={lectureName}
                  onChange={(e) => setLectureName(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={lectureDescription}
                  onChange={(e) => setLectureDescription(e.target.value)}
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={2}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {[30, 60, 90].map((duration) => (
                      <button
                        key={duration}
                        onClick={() => setLectureDuration(duration)}
                        className={`p-2 rounded text-sm ${
                          lectureDuration === duration
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {duration}min
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    value={lectureDuration}
                    onChange={(e) => setLectureDuration(parseInt(e.target.value))}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="Custom duration"
                  />
                </div>
                <button
                  onClick={addLecture}
                  disabled={loading}
                  className="w-full p-3 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add Lecture
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Class Modal */}
        {showCreateClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Create Class</h3>
                <button onClick={() => setShowCreateClass(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Class Name"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={classDescription}
                  onChange={(e) => setClassDescription(e.target.value)}
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={3}
                />
                <button
                  onClick={createClass}
                  disabled={loading}
                  className="w-full p-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create Class
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Subject Modal */}
        {showAddSubject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Add Subject</h3>
                <button onClick={() => setShowAddSubject(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Subject Name"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Subject Code"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={subjectDescription}
                  onChange={(e) => setSubjectDescription(e.target.value)}
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={2}
                />
                <button
                  onClick={addSubject}
                  disabled={loading}
                  className="w-full p-3 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add Subject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Session Modal */}
        {showCreateSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Create Session</h3>
                <button onClick={() => setShowCreateSession(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                {/* Subject and Lecture Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Lecture
                  </label>
                  {selectedSubject && selectedSubject.lectures && selectedSubject.lectures.length > 0 ? (
                    <select
                      value={selectedLecture ? selectedSubject.lectures.indexOf(selectedLecture) : ''}
                      onChange={(e) => {
                        const lectureIndex = parseInt(e.target.value);
                        setSelectedLecture(selectedSubject.lectures[lectureIndex]);
                        setSessionDuration(selectedSubject.lectures[lectureIndex]?.duration || 60);
                      }}
                      className="w-full p-3 border rounded-lg"
                    >
                      <option value="">Choose a lecture to start session</option>
                      {selectedSubject.lectures.map((lecture, index) => (
                        <option key={index} value={index}>
                          {lecture.title} ({lecture.duration || 60} min)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        No lectures available. Create lectures first in the subject.
                      </p>
                    </div>
                  )}
                  
                  {selectedLecture && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900">{selectedLecture.title}</h4>
                      <p className="text-sm text-blue-700">{selectedSubject.name} ({selectedSubject.code})</p>
                      {selectedLecture.description && (
                        <p className="text-xs text-blue-600 mt-1">{selectedLecture.description}</p>
                      )}
                    </div>
                  )}
                </div>

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
                        value="college"
                        checked={sessionLocation === 'college'}
                        onChange={(e) => setSessionLocation(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">College Only (GPS Required)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="location"
                        value="anywhere"
                        checked={sessionLocation === 'anywhere'}
                        onChange={(e) => setSessionLocation(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">Anywhere (No GPS)</span>
                    </label>
                  </div>
                  
                  {sessionLocation === 'college' && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Allowed Radius</span>
                        <span className="text-sm text-blue-600">{allowedLocation.radius}m</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="500"
                        step="50"
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
      </div>
    </div>
  );
};

export default TeacherDashboard;
