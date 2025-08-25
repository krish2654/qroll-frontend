import React, { useState, useEffect } from 'react';
import { Plus, Play, X, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../services/api';

const TeacherDashboard = () => {
  const { user } = useAuth();
  
  // State management
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');

  useEffect(() => {
    if (user && user.role === 'teacher') {
      fetchClasses();
    }
  }, [user]);

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
    if (!className.trim() || !section.trim()) {
      showMessage('Please enter class name and section', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/classes/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: className.trim(),
          section: section.trim(),
          subjects: []
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchClasses();
        setShowCreateClass(false);
        setClassName('');
        setSection('');
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
      showMessage('Please enter subject name and code', 'error');
      return;
    }

    setLoading(true);
    try {
      const updatedSubjects = [...(selectedClass.subjects || []), {
        name: subjectName.trim(),
        code: subjectCode.trim()
      }];

      const response = await fetch(`${API_BASE_URL}/classes/${selectedClass._id}/update`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ subjects: updatedSubjects })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchClasses();
        setSelectedClass({...selectedClass, subjects: updatedSubjects});
        setShowAddSubject(false);
        setSubjectName('');
        setSubjectCode('');
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

  const startLecture = async (classId, subjectId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/lectures/start`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ classId, subjectId })
      });
      
      const data = await response.json();
      if (data.success) {
        showMessage('Lecture started successfully!');
        // Navigate to lecture view or show QR code
      } else {
        showMessage(data.message || 'Failed to start lecture', 'error');
      }
    } catch (error) {
      showMessage('Failed to start lecture', 'error');
    } finally {
      setLoading(false);
    }
  };

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
              <p className="text-gray-600">Section {selectedClass.section}</p>
            </div>

            {/* Add Subject Button */}
            <button
              onClick={() => setShowAddSubject(true)}
              className="w-full p-3 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Subject
            </button>

            {/* Subjects List */}
            <div className="space-y-2">
              {selectedClass.subjects?.map((subject, index) => (
                <div key={index} className="p-3 bg-white rounded-lg shadow border">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">{subject.name}</h4>
                      <p className="text-sm text-gray-600">{subject.code}</p>
                    </div>
                    <button
                      onClick={() => startLecture(selectedClass._id, subject._id)}
                      disabled={loading}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      Start
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {selectedClass.subjects?.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <p>No subjects yet. Add a subject to start lectures!</p>
              </div>
            )}
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
                <input
                  type="text"
                  placeholder="Section"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full p-3 border rounded-lg"
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
      </div>
    </div>
  );
};

export default TeacherDashboard;
