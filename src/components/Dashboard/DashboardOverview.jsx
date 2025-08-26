import React from 'react';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Play, 
  Calendar,
  TrendingUp,
  Clock,
  Award,
  ArrowUpRight,
  Sparkles,
  Target,
  Zap
} from 'lucide-react';

const DashboardOverview = ({ classes, onNavigateToClasses, user }) => {
  const stats = [
    {
      name: 'Classes',
      value: classes?.length || 0,
      icon: BookOpen,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      change: '+12%',
      onClick: () => onNavigateToClasses()
    },
    {
      name: 'Total Students',
      value: '156',
      icon: Users,
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
      change: '+8%'
    },
    {
      name: 'Lectures',
      value: '24',
      icon: GraduationCap,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      change: '+15%'
    },
    {
      name: 'Active Sessions',
      value: '3',
      icon: Play,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
      change: '+2%'
    }
  ];

  const recentActivity = [
    { action: 'Created new class', subject: 'Mathematics 101', time: '2 hours ago', icon: BookOpen, color: 'blue' },
    { action: 'Started session', subject: 'Physics Lab', time: '4 hours ago', icon: Play, color: 'green' },
    { action: 'Added lecture', subject: 'Chemistry Basics', time: '1 day ago', icon: GraduationCap, color: 'purple' },
    { action: 'Updated attendance', subject: 'Biology Class', time: '2 days ago', icon: Users, color: 'orange' }
  ];

  const quickActions = [
    {
      title: 'Create New Class',
      description: 'Set up a new class with subjects',
      icon: BookOpen,
      gradient: 'from-blue-500 to-purple-600',
      bgGradient: 'from-blue-50 to-purple-50',
      onClick: () => onNavigateToClasses()
    },
    {
      title: 'Add Lecture',
      description: 'Create engaging lecture content',
      icon: GraduationCap,
      gradient: 'from-emerald-500 to-cyan-500',
      bgGradient: 'from-emerald-50 to-cyan-50',
      onClick: () => onNavigateToClasses()
    },
    {
      title: 'Start Session',
      description: 'Begin live attendance tracking',
      icon: Play,
      gradient: 'from-orange-500 to-pink-500',
      bgGradient: 'from-orange-50 to-pink-50',
      onClick: () => onNavigateToClasses()
    }
  ];

  return (
    <div className="space-y-6">
      {/* Premium Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-3">
            <Sparkles className="w-6 h-6 mr-2 text-yellow-300" />
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.name || 'Teacher'}!
            </h1>
          </div>
          <p className="text-blue-100 mb-4 max-w-2xl">
            Ready to inspire minds today? Your educational journey continues with powerful tools and insights.
          </p>
          <div className="flex items-center text-sm text-blue-200">
            <Target className="w-4 h-4 mr-2" />
            <span>Today's goal: Engage and educate with excellence</span>
          </div>
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            onClick={stat.onClick}
            className={`group relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 ${
              stat.onClick ? 'cursor-pointer hover:scale-105' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center text-xs font-semibold text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            {stat.onClick && (
              <ArrowUpRight className="absolute top-4 right-4 w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            )}
          </div>
        ))}
      </div>

      {/* Premium Quick Actions */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20">
        <div className="flex items-center mb-4">
          <Zap className="w-5 h-5 text-yellow-500 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`group relative overflow-hidden bg-gradient-to-br ${action.bgGradient} rounded-xl p-4 hover:shadow-xl transition-all duration-300 border border-white/50 hover:scale-105`}
            >
              <div className="flex items-start mb-3">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
              <ArrowUpRight className="absolute top-4 right-4 w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Premium Recent Activity */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="group flex items-center p-3 bg-white/50 rounded-xl hover:bg-white/80 transition-all duration-200 border border-white/30">
                  <div className={`p-2 rounded-xl bg-gradient-to-br from-${activity.color}-500 to-${activity.color}-600 shadow-lg mr-3`}>
                    <activity.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-600">{activity.subject}</p>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{activity.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No recent activity</p>
            </div>
          )}
        </div>

        {/* Premium Today's Schedule */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Schedule</h2>
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-base font-medium mb-3">No sessions scheduled for today</p>
            <button
              onClick={() => onNavigateToClasses()}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule a session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
