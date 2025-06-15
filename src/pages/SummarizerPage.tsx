import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Clock, 
  Download, 
  Copy, 
  Share2, 
  Bookmark,
  AlertCircle,
  CheckCircle,
  Loader,
  ExternalLink,
  Key,
  Settings,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import VideoInput from '../components/VideoInput';
import SummaryDisplay from '../components/SummaryDisplay';
import { useAuth } from '../contexts/AuthContext';
import { YouTubeService } from '../services/youtubeService';
import { AIService } from '../services/aiService';

export interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  channelName: string;
  viewCount: string;
  publishedAt: string;
  url: string;
}

export interface Summary {
  id: string;
  videoData: VideoData;
  content: string;
  keyPoints: string[];
  chapters: { title: string; timestamp: string; summary: string }[];
  summaryType: 'short' | 'medium' | 'detailed';
  createdAt: string;
  wordCount: number;
  readingTime: number;
  tags: string[];
  quotes?: string[]; // Add quotes to Summary interface
  saved?: boolean;
}

interface AdvancedOptions {
  includeTimestamps: boolean;
  extractKeyQuotes: boolean;
  generateTags: boolean;
  includeChapters: boolean;
  focusArea: 'general' | 'technical' | 'educational' | 'business';
  language: 'english' | 'spanish' | 'french' | 'german';
}

const SummarizerPage: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const { user } = useAuth();

  const hasApiKeys = import.meta.env.VITE_YOUTUBE_API_KEY && import.meta.env.VITE_GEMINI_API_KEY;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Check if current summary is already saved
  useEffect(() => {
    if (summary && user) {
      const savedSummaries = JSON.parse(localStorage.getItem(`summaryHistory_${user.id}`) || '[]');
      const isAlreadySaved = savedSummaries.some((s: Summary) => s.id === summary.id);
      setIsSaved(isAlreadySaved);
    }
  }, [summary, user]);

  const handleVideoSubmit = async (url: string, summaryType: 'short' | 'medium' | 'detailed', options: AdvancedOptions) => {
    if (!user) {
      toast.error('Please log in to use the summarizer');
      return;
    }

    if (!hasApiKeys) {
      toast.error('API keys are not configured. Please check the setup instructions.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSummary(null);
    setIsSaved(false);

    try {
      // Step 1: Extract video ID
      setProcessingStep('Extracting video information...');
      const videoId = YouTubeService.extractVideoId(url);
      
      if (!videoId) {
        throw new Error('Invalid YouTube URL. Please check the URL and try again.');
      }

      // Step 2: Get video information
      setProcessingStep('Fetching video details from YouTube...');
      const videoInfo = await YouTubeService.getVideoInfo(videoId);

      // Step 3: Get video content (description)
      setProcessingStep('Extracting video content...');
      const content = await YouTubeService.getVideoTranscript(videoId);
      
      if (!content || content.length < 50) {
        throw new Error('Unable to extract sufficient content from this video. The video might not have a detailed description available for summarization.');
      }

      // Step 4: Generate AI summary with advanced options and video duration
      setProcessingStep('Generating AI summary with Gemini...');
      const aiResponse = await AIService.summarizeContent({
        content: content,
        summaryType: summaryType,
        includeKeyPoints: true,
        includeChapters: options.includeChapters,
        focusArea: options.focusArea,
        language: options.language,
        videoDuration: videoInfo.duration, // Pass video duration for accurate timestamps
        ...options
      });

      // Step 5: Create final summary object
      const finalSummary: Summary = {
        id: Date.now().toString(),
        videoData: {
          id: videoInfo.id,
          title: videoInfo.title,
          thumbnail: videoInfo.thumbnail,
          duration: videoInfo.duration,
          channelName: videoInfo.channelName,
          viewCount: videoInfo.viewCount,
          publishedAt: videoInfo.publishedAt,
          url: url
        },
        content: aiResponse.summary,
        keyPoints: aiResponse.keyPoints,
        chapters: aiResponse.chapters,
        summaryType,
        createdAt: new Date().toISOString(),
        wordCount: aiResponse.wordCount,
        readingTime: aiResponse.readingTime,
        tags: aiResponse.tags,
        quotes: aiResponse.quotes, // Include quotes from AI response
        saved: false
      };

      setSummary(finalSummary);
      toast.success('Video summarized successfully with AI!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process video. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Summarization error:', err);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleSaveToHistory = () => {
    if (!summary || !user) {
      toast.error('Unable to save summary');
      return;
    }

    try {
      const storageKey = `summaryHistory_${user.id}`;
      const existingHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Check if already saved
      const isAlreadySaved = existingHistory.some((s: Summary) => s.id === summary.id);
      if (isAlreadySaved) {
        toast.info('Summary is already saved to history');
        return;
      }

      // Add to history
      const updatedSummary = { ...summary, saved: true };
      existingHistory.unshift(updatedSummary);
      
      // Keep last 100 summaries per user
      const limitedHistory = existingHistory.slice(0, 100);
      localStorage.setItem(storageKey, JSON.stringify(limitedHistory));
      
      setIsSaved(true);
      setSummary(updatedSummary);
      toast.success('Summary saved to history!');
    } catch (error) {
      console.error('Error saving to history:', error);
      toast.error('Failed to save summary');
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            YouTube Video Summarizer
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Paste any YouTube URL and get an AI-powered summary in seconds
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <VideoInput onSubmit={handleVideoSubmit} isProcessing={isProcessing} />
            
            {/* Processing Status */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-blue-500/20 backdrop-blur-md rounded-lg p-4 border border-blue-500/30"
              >
                <div className="flex items-center space-x-3">
                  <Loader className="w-5 h-5 text-blue-400 animate-spin" />
                  <div className="flex-1">
                    <p className="text-white font-medium">Processing video...</p>
                    <p className="text-gray-300 text-sm">{processingStep}</p>
                  </div>
                </div>
                <div className="mt-3 bg-blue-500/10 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </motion.div>
            )}

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-red-500/20 backdrop-blur-md rounded-lg p-4 border border-red-500/30"
              >
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-white font-medium">Error</p>
                    <p className="text-gray-300 text-sm">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Save to History Button */}
            {summary && user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <button
                  onClick={handleSaveToHistory}
                  disabled={isSaved}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    isSaved
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 hover:scale-105 transform'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Saved to History</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save to History</span>
                    </>
                  )}
                </button>
                {!isSaved && (
                  <p className="text-gray-400 text-sm text-center mt-2">
                    Save this summary to access it later in your history
                  </p>
                )}
              </motion.div>
            )}

            {/* Features */}
            <div className="mt-6 bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <h3 className="text-white font-semibold mb-4">Features</h3>
              <ul className="space-y-2">
                {[
                  "Real AI-powered summarization",
                  "YouTube API integration",
                  "Key points extraction",
                  "Accurate video timestamps",
                  "Real quotes from content",
                  "Multiple summary lengths",
                  "Advanced options & focus areas",
                  "Export to PDF/Text",
                  "Manual save to history"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Summary Display */}
          <div className="lg:col-span-2">
            {summary ? (
              <SummaryDisplay summary={summary} />
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-12 border border-white/20 text-center">
                <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Ready to summarize your video?
                </h3>
                <p className="text-gray-300 mb-6">
                  Enter a YouTube URL to get started with AI-powered summarization
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <p className="text-gray-300">Paste YouTube URL</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <p className="text-gray-300">AI analyzes content</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <p className="text-gray-300">Get your summary</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummarizerPage;