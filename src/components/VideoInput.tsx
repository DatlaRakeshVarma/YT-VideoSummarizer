import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Link as LinkIcon, Settings, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AdvancedOptions {
  includeTimestamps: boolean;
  extractKeyQuotes: boolean;
  generateTags: boolean;
  includeChapters: boolean;
  focusArea: 'general' | 'technical' | 'educational' | 'business';
  language: 'english' | 'spanish' | 'french' | 'german';
}

interface VideoInputProps {
  onSubmit: (url: string, summaryType: 'short' | 'medium' | 'detailed', options: AdvancedOptions) => void;
  isProcessing: boolean;
}

const VideoInput: React.FC<VideoInputProps> = ({ onSubmit, isProcessing }) => {
  const [url, setUrl] = useState('');
  const [summaryType, setSummaryType] = useState<'short' | 'medium' | 'detailed'>('medium');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showFocusDropdown, setShowFocusDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState<AdvancedOptions>({
    includeTimestamps: true,
    extractKeyQuotes: true, // Changed to true by default
    generateTags: true,
    includeChapters: true,
    focusArea: 'general',
    language: 'english'
  });
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    if (!isValidYouTubeUrl(url)) {
      alert('Please enter a valid YouTube URL');
      return;
    }

    onSubmit(url, summaryType, advancedOptions);
  };

  const isValidYouTubeUrl = (url: string): boolean => {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+/;
    return pattern.test(url);
  };

  const handlePasteExample = () => {
    setUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  };

  const handleClearUrl = () => {
    setUrl('');
  };

  const updateAdvancedOption = (key: keyof AdvancedOptions, value: any) => {
    setAdvancedOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const focusOptions = [
    { value: 'general', label: 'General Content' },
    { value: 'technical', label: 'Technical/Programming' },
    { value: 'educational', label: 'Educational/Learning' },
    { value: 'business', label: 'Business/Marketing' }
  ];

  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    { value: 'german', label: 'German' }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 overflow-visible">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <LinkIcon className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Video Input</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">
              YouTube URL
            </label>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={isProcessing}
                />
                {url && (
                  <button
                    type="button"
                    onClick={handleClearUrl}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 group"
                    disabled={isProcessing}
                    title="Clear URL"
                  >
                    <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={handlePasteExample}
                className="w-full px-3 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-500/30 hover:border-blue-500/50 rounded-lg text-blue-300 hover:text-blue-200 text-sm font-medium transition-all duration-200 backdrop-blur-sm hover:scale-[1.02] transform"
                disabled={isProcessing}
              >
                Try Example Video
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Summary Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'short', label: 'Short', desc: '~100 words' },
                { value: 'medium', label: 'Medium', desc: '~300 words' },
                { value: 'detailed', label: 'Detailed', desc: '~500 words' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSummaryType(option.value as any)}
                  className={`p-3 rounded-lg border text-center transition-all duration-200 hover:scale-105 transform ${
                    summaryType === option.value
                      ? 'bg-blue-500/30 border-blue-500/50 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30'
                  }`}
                  disabled={isProcessing}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs opacity-70">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-sm text-gray-300 hover:text-white transition-colors p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
            disabled={isProcessing}
          >
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Advanced Options</span>
            </div>
            <motion.div
              animate={{ rotate: showAdvanced ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 pt-4 border-t border-white/20"
              >
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Focus Area
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowFocusDropdown(!showFocusDropdown)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between hover:bg-white/15 transition-all duration-200"
                      disabled={isProcessing}
                    >
                      <span>{focusOptions.find(opt => opt.value === advancedOptions.focusArea)?.label}</span>
                      <motion.div
                        animate={{ rotate: showFocusDropdown ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {showFocusDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-slate-900/95 backdrop-blur-md rounded-lg border border-white/30 shadow-2xl z-[100]"
                        >
                          <div className="py-1">
                            {focusOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  updateAdvancedOption('focusArea', option.value);
                                  setShowFocusDropdown(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                  advancedOptions.focusArea === option.value
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Summary Language
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between hover:bg-white/15 transition-all duration-200"
                      disabled={isProcessing}
                    >
                      <span>{languageOptions.find(opt => opt.value === advancedOptions.language)?.label}</span>
                      <motion.div
                        animate={{ rotate: showLanguageDropdown ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {showLanguageDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-slate-900/95 backdrop-blur-md rounded-lg border border-white/30 shadow-2xl z-[100]"
                        >
                          <div className="py-1">
                            {languageOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  updateAdvancedOption('language', option.value);
                                  setShowLanguageDropdown(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                  advancedOptions.language === option.value
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

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-300">Include in Summary:</h4>
                  
                  <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={advancedOptions.includeTimestamps}
                      onChange={(e) => updateAdvancedOption('includeTimestamps', e.target.checked)}
                      className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                      disabled={isProcessing}
                    />
                    <span className="text-sm text-gray-300">Include timestamps in chapters</span>
                  </label>

                  <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={advancedOptions.includeChapters}
                      onChange={(e) => updateAdvancedOption('includeChapters', e.target.checked)}
                      className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                      disabled={isProcessing}
                    />
                    <span className="text-sm text-gray-300">Generate chapter breakdown</span>
                  </label>

                  <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={advancedOptions.extractKeyQuotes}
                      onChange={(e) => updateAdvancedOption('extractKeyQuotes', e.target.checked)}
                      className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                      disabled={isProcessing}
                    />
                    <span className="text-sm text-gray-300">Extract key quotes</span>
                  </label>

                  <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={advancedOptions.generateTags}
                      onChange={(e) => updateAdvancedOption('generateTags', e.target.checked)}
                      className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                      disabled={isProcessing}
                    />
                    <span className="text-sm text-gray-300">Generate relevant tags</span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={!url.trim() || isProcessing || !user}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 hover:scale-[1.02] transform shadow-lg hover:shadow-xl"
          >
            <Play className="w-5 h-5" />
            <span>{isProcessing ? 'Processing...' : 'Summarize Video'}</span>
          </button>

          {!user && (
            <p className="text-sm text-gray-400 text-center">
              Please <a href="/login" className="text-blue-400 hover:underline">log in</a> to use the summarizer
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default VideoInput;