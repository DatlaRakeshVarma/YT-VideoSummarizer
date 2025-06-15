import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Copy, 
  Download, 
  Share2, 
  Bookmark, 
  Clock, 
  Eye, 
  ExternalLink,
  FileText,
  Tag,
  ChevronDown,
  ChevronUp,
  Quote,
  Hash,
  List,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Summary } from '../pages/SummarizerPage';
import { format } from 'date-fns';

interface SummaryDisplayProps {
  summary: Summary;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'keypoints' | 'chapters' | 'quotes'>('summary');

  const handleCopy = () => {
    const textToCopy = `${summary.videoData.title}\n\n${summary.content}`;
    navigator.clipboard.writeText(textToCopy);
    toast.success('Summary copied to clipboard!');
  };

  const handleDownload = () => {
    const content = `${summary.videoData.title}\n\nSummary:\n${summary.content}\n\nKey Points:\n${summary.keyPoints.map(point => `• ${point}`).join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summary.videoData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Summary downloaded!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: summary.videoData.title,
        text: summary.content,
        url: summary.videoData.url,
      });
    } else {
      handleCopy();
    }
  };

  const tabs = [
    { id: 'summary', label: 'Summary', icon: <FileText className="w-4 h-4" /> },
    { id: 'keypoints', label: 'Key Points', icon: <List className="w-4 h-4" /> },
    { id: 'chapters', label: 'Chapters', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'quotes', label: 'Quotes', icon: <Quote className="w-4 h-4" /> },
  ];

  // Format summary content with better structure
  const formatSummaryContent = (content: string) => {
    // Split into paragraphs and format
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => {
      // Check if it's a heading (starts with numbers or capital letters)
      if (paragraph.match(/^(\d+\.|[A-Z][^.]*:|\*\*[^*]+\*\*)/)) {
        return (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">
              {paragraph.replace(/^\*\*|\*\*$/g, '')}
            </h3>
          </div>
        );
      }
      
      // Regular paragraph
      return (
        <p key={index} className="text-gray-300 leading-relaxed mb-4">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden"
    >
      {/* Video Info */}
      <div className="p-6 border-b border-white/20">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-shrink-0">
            <img
              src={summary.videoData.thumbnail}
              alt={summary.videoData.title}
              className="w-full lg:w-48 h-auto lg:h-28 object-cover rounded-lg shadow-lg"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white mb-3 line-clamp-2">
              {summary.videoData.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-3">
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{summary.videoData.duration}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{summary.videoData.viewCount} views</span>
              </span>
              <span className="font-medium">{summary.videoData.channelName}</span>
            </div>
            
            {/* Summary Stats */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-blue-300 mb-3">
              <span>{summary.wordCount} words</span>
              <span>{summary.readingTime} min read</span>
              <span className="capitalize">{summary.summaryType} summary</span>
              {summary.saved && (
                <span className="text-green-400">✓ Saved</span>
              )}
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {summary.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30 flex items-center space-x-1"
                >
                  <Hash className="w-3 h-3" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-6">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 hover:scale-105"
          >
            <Copy className="w-4 h-4" />
            <span>Copy</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 hover:scale-105"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          <a
            href={summary.videoData.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 text-red-300 rounded-lg transition-all duration-200 hover:scale-105 border border-red-500/30"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Watch Video</span>
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/20 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm text-gray-300 mb-6 p-4 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>{summary.wordCount} words</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{summary.readingTime} min read</span>
                </span>
              </div>
              <span>Generated {format(new Date(summary.createdAt), 'MMM d, yyyy')}</span>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 leading-relaxed space-y-4">
                {formatSummaryContent(summary.content)}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'keypoints' && (
          <div className="space-y-4">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Key Takeaways</h3>
              <p className="text-gray-400 text-sm">Main points extracted from the video content</p>
            </div>
            
            {summary.keyPoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-4 p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>
                <p className="text-gray-300 leading-relaxed">{point}</p>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'chapters' && (
          <div className="space-y-4">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Chapter Breakdown</h3>
              <p className="text-gray-400 text-sm">Video content organized by topics with accurate timestamps</p>
            </div>
            
            {summary.chapters.map((chapter, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-6 border border-white/10 hover:border-white/20 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold text-lg">{chapter.title}</h3>
                  <span className="text-blue-400 text-sm font-mono bg-blue-500/20 px-3 py-1 rounded-full">
                    {chapter.timestamp}
                  </span>
                </div>
                <p className="text-gray-300 leading-relaxed">{chapter.summary}</p>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'quotes' && (
          <div className="space-y-4">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Key Quotes</h3>
              <p className="text-gray-400 text-sm">Important statements extracted from the video content</p>
            </div>
            
            {summary.quotes && summary.quotes.length > 0 ? (
              summary.quotes.map((quote, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-6 border border-purple-500/20"
                >
                  <Quote className="absolute top-4 left-4 w-6 h-6 text-purple-400 opacity-50" />
                  <blockquote className="text-gray-300 text-lg italic leading-relaxed ml-8">
                    "{quote}"
                  </blockquote>
                  <div className="mt-4 ml-8">
                    <span className="text-sm text-gray-400">— From the video content</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <Quote className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
                <p className="text-gray-400">No direct quotes available from the video content.</p>
                <p className="text-gray-500 text-sm mt-2">
                  Quotes are extracted from the video description when available.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SummaryDisplay;