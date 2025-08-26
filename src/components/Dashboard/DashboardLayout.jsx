import React, { useState } from 'react';
import { 
  Home, 
  BookOpen, 
  Users, 
  GraduationCap, 
  Play, 
  BarChart3, 
  Menu, 
  X,
  User,
  LogOut,
  ChevronDown,
  Bell,
  Settings,
  Search
} from 'lucide-react';

const DashboardLayout = ({ children, currentPage, onNavigate, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navigation = [
    { name: 'Overview', icon: Home, page: 'overview' },
    { name: 'Classes', icon: BookOpen, page: 'classes' },
    { name: 'Sessions', icon: Play, page: 'sessions' },
    { name: 'Reports', icon: BarChart3, page: 'reports' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Premium Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-white/20 transform transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo Section */}
        <div className="flex items-center justify-between h-20 px-8 border-b border-gray-100/50">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">QRoll</span>
              <p className="text-xs text-gray-500 font-medium">Education Platform</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-6">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = currentPage === item.page;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    onNavigate(item.page);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]'
                      : 'text-gray-600 hover:bg-white/70 hover:text-gray-900 hover:shadow-md hover:transform hover:scale-[1.01]'
                  }`}
                >
                  <div className={`p-2 rounded-xl mr-4 transition-all ${
                    isActive 
                      ? 'bg-white/20' 
                      : 'bg-gray-100 group-hover:bg-white group-hover:shadow-sm'
                  }`}>
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
                  </div>
                  {item.name}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Profile Card */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border border-gray-100/50 shadow-sm">
            <div className="flex items-center">
              <img
                src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3b82f6&color=fff`}
                alt={user?.name}
                className="w-12 h-12 rounded-xl shadow-md"
              />
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Premium Top bar */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-3 rounded-2xl text-gray-400 hover:text-gray-600 hover:bg-white/70 transition-all shadow-sm"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="ml-2 lg:ml-0">
                <h1 className="text-2xl font-bold text-gray-900 capitalize">
                  {currentPage}
                </h1>
                <p className="text-sm text-gray-500 font-medium">Manage your educational content</p>
              </div>
            </div>

            {/* Top bar actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:flex items-center bg-gray-50/70 rounded-2xl px-4 py-2 min-w-[300px]">
                <Search className="w-4 h-4 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search classes, subjects, lectures..."
                  className="bg-transparent border-none outline-none text-sm text-gray-600 placeholder-gray-400 flex-1"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-3 rounded-2xl text-gray-400 hover:text-gray-600 hover:bg-white/70 transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Settings */}
              <button className="p-3 rounded-2xl text-gray-400 hover:text-gray-600 hover:bg-white/70 transition-all">
                <Settings className="w-5 h-5" />
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center p-2 rounded-2xl hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <img
                    src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3b82f6&color=fff`}
                    alt={user?.name}
                    className="w-10 h-10 rounded-xl shadow-md"
                  />
                  <ChevronDown className="ml-2 w-4 h-4 text-gray-500" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl py-2 z-50 border border-white/20">
                    <div className="px-6 py-4 border-b border-gray-100/50">
                      <div className="flex items-center">
                        <img
                          src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3b82f6&color=fff`}
                          alt={user?.name}
                          className="w-12 h-12 rounded-xl shadow-md"
                        />
                        <div className="ml-3">
                          <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        // Add profile navigation here
                      }}
                      className="flex items-center w-full px-6 py-3 text-sm text-gray-700 hover:bg-gray-50/70 transition-all"
                    >
                      <div className="p-2 rounded-xl bg-gray-100 mr-3">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="flex items-center w-full px-6 py-3 text-sm text-red-600 hover:bg-red-50/70 transition-all"
                    >
                      <div className="p-2 rounded-xl bg-red-100 mr-3">
                        <LogOut className="h-4 w-4 text-red-600" />
                      </div>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
