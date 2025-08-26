import React, { useState } from 'react';
import { Plus, BookOpen, Users, Calendar, Search, Filter, Sparkles, TrendingUp, ArrowUpRight, Star } from 'lucide-react';

const ClassesPage = ({ classes, onCreateClass, onSelectClass, loading }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newClass, setNewClass] = useState({
    name: '',
    section: '',
    description: ''
  });

  const filteredClasses = classes?.filter(cls => 
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.section?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClass.name.trim()) return;
    
    await onCreateClass(newClass);
    setNewClass({ name: '', section: '', description: '' });
    setShowCreateModal(false);
  };

  const getClassGradient = (index) => {
    const gradients = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-emerald-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-green-500 to-blue-500'
    ];
    return gradients[index % gradients.length];
  };

  const getClassBgGradient = (index) => {
    const gradients = [
      'from-blue-50 to-cyan-50',
      'from-purple-50 to-pink-50',
      'from-emerald-50 to-teal-50',
      'from-orange-50 to-red-50',
      'from-indigo-50 to-purple-50',
      'from-green-50 to-blue-50'
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-24"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="flex items-center mb-3">
              <Sparkles className="w-6 h-6 mr-3 text-yellow-300" />
              <h1 className="text-3xl font-bold">Classes</h1>
            </div>
            <p className="text-blue-100 text-lg">Organize and manage your educational content with style</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-2xl hover:bg-white/30 transition-all duration-200 border border-white/20 hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Class
          </button>
        </div>
      </div>

      {/* Premium Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search classes, sections, descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all shadow-lg text-gray-700 placeholder-gray-500"
          />
        </div>
        <button className="inline-flex items-center px-6 py-4 bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/90 transition-all shadow-lg text-gray-700 hover:scale-105">
          <Filter className="w-5 h-5 mr-2" />
          Filter & Sort
        </button>
      </div>

      {/* Premium Classes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 animate-pulse">
              <div className="h-6 bg-gray-200 rounded-2xl w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded-xl w-1/2 mb-6"></div>
              <div className="h-4 bg-gray-200 rounded-xl w-full mb-3"></div>
              <div className="h-4 bg-gray-200 rounded-xl w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredClasses.map((cls, index) => (
            <div
              key={cls._id}
              onClick={() => onSelectClass(cls)}
              className={`group relative overflow-hidden bg-gradient-to-br ${getClassBgGradient(index)} rounded-3xl p-8 shadow-xl hover:shadow-2xl border border-white/50 hover:border-white/70 transition-all duration-300 cursor-pointer hover:scale-105`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 bg-gradient-to-br ${getClassGradient(index)} rounded-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className="text-xs font-semibold text-gray-600 bg-white/70 px-3 py-1 rounded-full border border-white/30">
                    {cls.subjects?.length || 0} subjects
                  </span>
                  <div className="flex items-center text-xs font-semibold text-green-600">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Active
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {cls.name}
              </h3>
              
              {cls.section && (
                <div className="flex items-center mb-3">
                  <Star className="w-4 h-4 text-yellow-500 mr-2" />
                  <p className="text-sm font-medium text-gray-700">Section {cls.section}</p>
                </div>
              )}
              
              {cls.description && (
                <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed">{cls.description}</p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm font-medium text-gray-600">
                    <div className="p-2 bg-white/50 rounded-xl mr-2">
                      <Users className="w-4 h-4" />
                    </div>
                    <span>{cls.totalStudents || 0}</span>
                  </div>
                  <div className="flex items-center text-sm font-medium text-gray-600">
                    <div className="p-2 bg-white/50 rounded-xl mr-2">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span>Today</span>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {searchTerm ? 'No classes found' : 'Ready to create your first class?'}
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
            {searchTerm 
              ? 'Try adjusting your search terms or create a new class' 
              : 'Start your educational journey by setting up your first class with subjects and lectures'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-2xl transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-3" />
            Create Your First Class
          </button>
        </div>
      )}

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Create New Class</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setClassName('');
                  setClassDescription('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Name *
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g., Physics 101, Mathematics 2025"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={classDescription}
                  onChange={(e) => setClassDescription(e.target.value)}
                  placeholder="Brief description of the class..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setClassName('');
                    setClassDescription('');
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateClass}
                  disabled={!className.trim() || loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Class'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setDropdownOpen(null)}
        />
      )}
    </div>
  );
};

export default ClassesPage;
