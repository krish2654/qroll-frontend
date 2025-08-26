import React from 'react';
import { BookOpen, Users, GraduationCap, Play, TrendingUp, Calendar } from 'lucide-react';

const DashboardOverview = ({ classes, onNavigate }) => {
  // Calculate stats
  const totalClasses = classes?.length || 0;
  const totalSubjects = classes?.reduce((sum, cls) => sum + (cls.subjects?.length || 0), 0) || 0;
  const totalLectures = classes?.reduce((sum, cls) => 
    sum + (cls.subjects?.reduce((subSum, subject) => 
      subSum + (subject.lectures?.length || 0), 0) || 0), 0) || 0;

  const stats = [
    {
      name: 'Classes',
      value: totalClasses,
      icon: BookOpen,
      color: 'bg-blue-500',
      onClick: () => onNavigate('classes')
    },
    {
      name: 'Subjects',
      value: totalSubjects,
      icon: Users,
      color: 'bg-green-500',
      onClick: () => onNavigate('subjects')
    },
    {
      name: 'Lectures',
      value: totalLectures,
      icon: GraduationCap,
      color: 'bg-purple-500',
      onClick: () => onNavigate('lectures')
    },
    {
      name: 'Active Sessions',
      value: 0, // TODO: Get from active sessions
      icon: Play,
      color: 'bg-orange-500',
      onClick: () => onNavigate('sessions')
    }
  ];

  const recentActivity = [
    { type: 'class', message: 'Created new class "Physics 101"', time: '2 hours ago' },
    { type: 'lecture', message: 'Added lecture "Quantum Mechanics"', time: '1 day ago' },
    { type: 'session', message: 'Completed session for "Mathematics"', time: '2 days ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, Teacher!</h1>
        <p className="text-blue-100">Ready to manage your classes and track attendance?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            onClick={stat.onClick}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('classes')}
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <BookOpen className="w-5 h-5 text-blue-600 mr-3" />
            <span className="font-medium text-blue-900">Create New Class</span>
          </button>
          <button
            onClick={() => onNavigate('lectures')}
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <GraduationCap className="w-5 h-5 text-green-600 mr-3" />
            <span className="font-medium text-green-900">Add Lecture</span>
          </button>
          <button
            onClick={() => onNavigate('sessions')}
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Play className="w-5 h-5 text-purple-600 mr-3" />
            <span className="font-medium text-purple-900">Start Session</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No recent activity</p>
            <p className="text-sm">Start by creating a class or adding lectures</p>
          </div>
        )}
      </div>

      {/* Today's Schedule (placeholder) */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h2>
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No sessions scheduled for today</p>
          <button
            onClick={() => onNavigate('sessions')}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Schedule a session
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
