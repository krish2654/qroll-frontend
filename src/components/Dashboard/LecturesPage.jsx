import React, { useState } from 'react';
import { Plus, GraduationCap, Clock, Calendar, Play, ArrowLeft, Search, Filter } from 'lucide-react';

const LecturesPage = ({ selectedSubject, onBack, onAddLecture, onStartSession, loading }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [lectureName, setLectureName] = useState('');
  const [lectureDescription, setLectureDescription] = useState('');
  const [lectureDuration, setLectureDuration] = useState(60);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddLecture = async () => {
    if (!lectureName.trim()) return;
    
    await onAddLecture({
      title: lectureName.trim(),
      description: lectureDescription.trim() || undefined,
      duration: lectureDuration
    });
    
    setShowAddModal(false);
    setLectureName('');
    setLectureDescription('');
    setLectureDuration(60);
  };

  const filteredLectures = selectedSubject?.lectures?.filter(lecture =>
    lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecture.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (!selectedSubject) {
    return (
      <div className="text-center py-12">
        <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No subject selected</h3>
        <p className="text-gray-600">Select a subject to manage its lectures</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Lectures</h1>
            <p className="text-gray-600">{selectedSubject.name} ({selectedSubject.code})</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Lecture
        </button>
      </div>

      {/* Subject Info Card */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <h3 className="text-xl font-semibold mb-2">{selectedSubject.name}</h3>
        <p className="text-purple-100 mb-3">{selectedSubject.code}</p>
        {selectedSubject.description && (
          <p className="text-purple-100 text-sm">{selectedSubject.description}</p>
        )}
        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
            {selectedSubject.lectures?.length || 0} lectures
          </span>
        </div>
      </div>

      {/* Search and Filter */}
      {selectedSubject.lectures && selectedSubject.lectures.length > 0 && (
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search lectures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      )}

      {/* Lectures List */}
      {filteredLectures.length > 0 ? (
        <div className="space-y-4">
          {filteredLectures.map((lecture, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{lecture.title}</h3>
                    <button
                      onClick={() => onStartSession(selectedSubject, lecture)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Start Session
                    </button>
                  </div>
                  
                  {lecture.description && (
                    <p className="text-gray-600 mb-3">{lecture.description}</p>
                  )}
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{lecture.duration || 60} minutes</span>
                    </div>
                    {lecture.date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(lecture.date).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <span>Created {new Date(lecture.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : selectedSubject.lectures && selectedSubject.lectures.length > 0 ? (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No lectures found</h3>
          <p className="text-gray-600">Try adjusting your search terms</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-12 h-12 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No lectures created yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start building your course content by creating your first lecture for {selectedSubject.name}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg flex items-center gap-2 mx-auto hover:bg-purple-700 transition-colors text-lg"
          >
            <Plus className="w-5 h-5" />
            Create Your First Lecture
          </button>
        </div>
      )}

      {/* Add Lecture Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Add New Lecture</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setLectureName('');
                  setLectureDescription('');
                  setLectureDuration(60);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="mb-4 p-3 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-purple-900">{selectedSubject.name}</p>
              <p className="text-xs text-purple-600">{selectedSubject.code}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lecture Title *
                </label>
                <input
                  type="text"
                  value={lectureName}
                  onChange={(e) => setLectureName(e.target.value)}
                  placeholder="e.g., Introduction to Quantum Mechanics"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={lectureDescription}
                  onChange={(e) => setLectureDescription(e.target.value)}
                  placeholder="Brief description of what will be covered..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[30, 60, 90].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setLectureDuration(duration)}
                      className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                        lectureDuration === duration
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                  onChange={(e) => setLectureDuration(parseInt(e.target.value) || 60)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Custom duration"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setLectureName('');
                    setLectureDescription('');
                    setLectureDuration(60);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLecture}
                  disabled={!lectureName.trim() || loading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Adding...' : 'Add Lecture'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturesPage;
