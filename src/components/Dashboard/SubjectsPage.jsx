import React, { useState } from 'react';
import { Plus, Users, GraduationCap, Play, ArrowLeft, MoreVertical, Edit, Trash2 } from 'lucide-react';

const SubjectsPage = ({ selectedClass, onBack, onAddSubject, onManageLectures, onStartSession, loading }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const handleAddSubject = async () => {
    if (!subjectName.trim() || !subjectCode.trim()) return;
    
    await onAddSubject({
      name: subjectName.trim(),
      code: subjectCode.trim(),
      description: subjectDescription.trim() || undefined
    });
    
    setShowAddModal(false);
    setSubjectName('');
    setSubjectCode('');
    setSubjectDescription('');
  };

  if (!selectedClass) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No class selected</h3>
        <p className="text-gray-600">Select a class to view its subjects</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedClass.name}</h1>
            <p className="text-gray-600">Manage subjects and lectures</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      </div>

      {/* Class Info Card */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{selectedClass.name}</h3>
            {selectedClass.description && (
              <p className="text-gray-600 mt-1">{selectedClass.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span>{selectedClass.subjects?.length || 0} subjects</span>
              {selectedClass.classCode && (
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                  {selectedClass.classCode}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      {selectedClass.subjects && selectedClass.subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedClass.subjects.map((subject, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen(dropdownOpen === index ? null : index);
                    }}
                    className="p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  {dropdownOpen === index && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <Edit className="mr-3 h-4 w-4" />
                          Edit Subject
                        </button>
                        <button className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                          <Trash2 className="mr-3 h-4 w-4" />
                          Delete Subject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1">{subject.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{subject.code}</p>
              
              {subject.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{subject.description}</p>
              )}

              <div className="flex items-center justify-between text-sm mb-4">
                <div className="flex items-center text-gray-500">
                  <GraduationCap className="w-4 h-4 mr-1" />
                  <span>{subject.lectures?.length || 0} lectures</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onManageLectures(subject)}
                  className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                >
                  <GraduationCap className="w-4 h-4" />
                  Lectures
                </button>
                <button
                  onClick={() => {
                    if (subject.lectures && subject.lectures.length > 0) {
                      onStartSession(subject);
                    }
                  }}
                  disabled={!subject.lectures || subject.lectures.length === 0}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                    subject.lectures && subject.lectures.length > 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  title={!subject.lectures || subject.lectures.length === 0 ? 'Create lectures first' : 'Start session'}
                >
                  <Play className="w-4 h-4" />
                  Session
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects yet</h3>
          <p className="text-gray-600 mb-6">Add subjects to start creating lectures</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Your First Subject
          </button>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Add New Subject</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSubjectName('');
                  setSubjectCode('');
                  setSubjectDescription('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">{selectedClass.name}</p>
              <p className="text-xs text-blue-600">Adding subject to this class</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g., Quantum Physics, Data Structures"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Code *
                </label>
                <input
                  type="text"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  placeholder="e.g., PHY101, CS201"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={subjectDescription}
                  onChange={(e) => setSubjectDescription(e.target.value)}
                  placeholder="Brief description of the subject..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSubjectName('');
                    setSubjectCode('');
                    setSubjectDescription('');
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSubject}
                  disabled={!subjectName.trim() || !subjectCode.trim() || loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Adding...' : 'Add Subject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {dropdownOpen !== null && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setDropdownOpen(null)}
        />
      )}
    </div>
  );
};

export default SubjectsPage;
