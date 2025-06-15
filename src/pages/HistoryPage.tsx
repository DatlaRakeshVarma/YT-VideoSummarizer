import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Calendar, Clock, Trash2, ExternalLink, Download, ChevronDown, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Summary } from '../pages/SummarizerPage';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const HistoryPage: React.FC = () => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'short' | 'medium' | 'detailed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (user) {
      const storageKey = `summaryHistory_${user.id}`;
      const history = JSON.parse(localStorage.getItem(storageKey) || '[]');
      setSummaries(history);
    }
  }, [user]);

  const filteredSummaries = summaries
    .filter((summary) => {
      const matchesSearch = summary.videoData.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           summary.videoData.channelName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || summary.summaryType === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return a.videoData.title.localeCompare(b.videoData.title);
      }
    });

  const handleDelete = (id: string) => {
    if (!user) return;
    
    const updatedSummaries = summaries.filter(s => s.id !== id);
    setSummaries(updatedSummaries);
    
    const storageKey = `summaryHistory_${user.id}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedSummaries));
  };

  const handleDownload = (summary: Summary) => {
    const content = `${summary.videoData.title}\n\nSummary:\n${summary.content}\n\nKey Points:\n${summary.keyPoints.map(point => `• ${point}`).join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summary.videoData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleViewSummary = (summary: Summary) => {
    setSelectedSummary(summary);
    setShowSummaryModal(true);
  };

  const filterOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'short', label: 'Short' },
    { value: 'medium', label: 'Medium' },
    { value: 'detailed', label: 'Detailed' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Sort by Date' },
    { value: 'title', label: 'Sort by Title' }
  ];

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-8">Please log in to view your summary history.</p>
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

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Summary History
          </h1>
          <p className="text-xl text-gray-300">
            View and manage all your saved video summaries
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search summaries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
              >
                <span>{filterOptions.find(opt => opt.value === filterType)?.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showFilterDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-slate-900/95 backdrop-blur-md rounded-lg border border-white/30 shadow-2xl z-[100]"
                  >
                    <div className="py-1">
                      {filterOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setFilterType(option.value as any);
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            filterType === option.value
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
            
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
              >
                <span>{sortOptions.find(opt => opt.value === sortBy)?.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showSortDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-slate-900/95 backdrop-blur-md rounded-lg border border-white/30 shadow-2xl z-[100]"
                  >
                    <div className="py-1">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value as any);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            sortBy === option.value
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
          </div>
        </div>

        {/* Summary Grid */}
        {filteredSummaries.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No summaries found</h3>
            <p className="text-gray-300 mb-6">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Start by summarizing and saving your first video!'}
            </p>
            <a
              href="/summarize"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
              Summarize Video
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSummaries.map((summary, index) => (
              <motion.div
                key={summary.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden hover:border-white/30 transition-all duration-200"
              >
                <div className="relative">
                  <img
                    src={summary.videoData.thumbnail}
                    alt={summary.videoData.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      summary.summaryType === 'short' ? 'bg-green-500/80 text-white' :
                      summary.summaryType === 'medium' ? 'bg-yellow-500/80 text-white' :
                      'bg-red-500/80 text-white'
                    }`}>
                      {summary.summaryType}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-2 line-clamp-2">
                    {summary.videoData.title}
                  </h3>
                  <p className="text-gray-300 text-sm mb-2">
                    {summary.videoData.channelName}
                  </p>
                  <p className="text-gray-400 text-sm mb-4">
                    Saved {format(new Date(summary.createdAt), 'MMM d, yyyy')}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewSummary(summary)}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                        title="View Summary"
                      >
                        <Eye className="w-4 h-4 text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDownload(summary)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-white" />
                      </button>
                      <a
                        href={summary.videoData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        title="Watch Video"
                      >
                        <ExternalLink className="w-4 h-4 text-white" />
                      </a>
                    </div>
                    <button
                      onClick={() => handleDelete(summary.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Summary Modal */}
        <AnimatePresence>
          {showSummaryModal && selectedSummary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
              onClick={() => setShowSummaryModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900/95 backdrop-blur-md rounded-lg border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Summary Details</h2>
                    <button
                      onClick={() => setShowSummaryModal(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Video Info */}
                    <div className="flex gap-4">
                      <img
                        src={selectedSummary.videoData.thumbnail}
                        alt={selectedSummary.videoData.title}
                        className="w-32 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {selectedSummary.videoData.title}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          {selectedSummary.videoData.channelName} • {selectedSummary.videoData.duration}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Saved {format(new Date(selectedSummary.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>

                    {/* Summary Content */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Summary</h4>
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {selectedSummary.content}
                        </p>
                      </div>
                    </div>

                    {/* Key Points */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Key Points</h4>
                      <div className="space-y-2">
                        {selectedSummary.keyPoints.map((point, index) => (
                          <div key={index} className="flex items-start space-x-3 bg-white/5 rounded-lg p-3">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">{index + 1}</span>
                            </div>
                            <p className="text-gray-300">{point}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSummary.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-500/30"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HistoryPage;