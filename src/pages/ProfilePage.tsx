import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Crown, Download, Calendar, BarChart3, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'usage'>('profile');
  const [showSummaryTypeDropdown, setShowSummaryTypeDropdown] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-8">Please log in to view your profile.</p>
          <a
            href="/login"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            Log In
          </a>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'usage', label: 'Usage', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const mockStats = {
    totalSummaries: 47,
    totalWatchTime: '12h 34m',
    avgSummaryLength: 'Medium',
    favoriteCategory: 'Education',
    thisMonth: 12,
    lastMonth: 23
  };

  const summaryTypeOptions = [
    { value: 'short', label: 'Short' },
    { value: 'medium', label: 'Medium' },
    { value: 'detailed', label: 'Detailed' }
  ];

  const [defaultSummaryType, setDefaultSummaryType] = useState('medium');

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Profile
          </h1>
          <p className="text-xl text-gray-300">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
              <div className="text-center mb-6">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                  alt={user.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4"
                />
                <h2 className="text-xl font-semibold text-white">{user.name}</h2>
                <p className="text-gray-300">{user.email}</p>
                <div className="flex items-center justify-center mt-2">
                  <Crown className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-sm font-medium text-yellow-400 capitalize">
                    {user.subscription}
                  </span>
                </div>
              </div>
              
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={user.name}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={user.email}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Member Since
                        </label>
                        <input
                          type="text"
                          value={format(new Date(user.createdAt), 'MMMM d, yyyy')}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Subscription Plan
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={user.subscription}
                            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
                            readOnly
                          />
                          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
                            Upgrade
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Preferences</h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Default Summary Type
                        </label>
                        <button
                          onClick={() => setShowSummaryTypeDropdown(!showSummaryTypeDropdown)}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                        >
                          <span>{summaryTypeOptions.find(opt => opt.value === defaultSummaryType)?.label}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${showSummaryTypeDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <AnimatePresence>
                          {showSummaryTypeDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute top-full left-0 right-0 mt-1 bg-slate-900/95 backdrop-blur-md rounded-lg border border-white/30 shadow-2xl z-[100]"
                            >
                              <div className="py-1">
                                {summaryTypeOptions.map((option) => (
                                  <button
                                    key={option.value}
                                    onClick={() => {
                                      setDefaultSummaryType(option.value);
                                      setShowSummaryTypeDropdown(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                      defaultSummaryType === option.value
                                        ? 'text-blue-400 bg-blue-500/20'
                                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                                    }`}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                            defaultChecked
                          />
                          <span className="text-gray-300">Email notifications for completed summaries</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                          />
                          <span className="text-gray-300">Auto-save summaries to history</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                            defaultChecked
                          />
                          <span className="text-gray-300">Include timestamps in summaries</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Privacy & Security</h3>
                    <div className="space-y-4">
                      <button className="w-full text-left px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-gray-300 hover:bg-white/10 transition-colors">
                        Change Password
                      </button>
                      <button className="w-full text-left px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-gray-300 hover:bg-white/10 transition-colors">
                        Two-Factor Authentication
                      </button>
                      <button className="w-full text-left px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-gray-300 hover:bg-white/10 transition-colors">
                        Download My Data
                      </button>
                      <button className="w-full text-left px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'usage' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Usage Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300">Total Summaries</span>
                          <BarChart3 className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{mockStats.totalSummaries}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300">Watch Time Saved</span>
                          <Calendar className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{mockStats.totalWatchTime}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300">This Month</span>
                          <Calendar className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{mockStats.thisMonth}</div>
                        <div className="text-sm text-gray-400">vs {mockStats.lastMonth} last month</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300">Avg. Length</span>
                          <Download className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{mockStats.avgSummaryLength}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {[
                        { action: 'Summarized', title: 'How to Build a Startup', time: '2 hours ago' },
                        { action: 'Downloaded', title: 'React Tutorial for Beginners', time: '1 day ago' },
                        { action: 'Bookmarked', title: 'AI and Machine Learning', time: '3 days ago' },
                        { action: 'Shared', title: 'Web Development Trends', time: '1 week ago' }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <span className="text-blue-400 font-medium">{activity.action}</span>
                            <span className="text-white ml-2">{activity.title}</span>
                          </div>
                          <span className="text-gray-400 text-sm">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;