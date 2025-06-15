import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, 
  Zap, 
  Clock, 
  BookOpen, 
  Download, 
  Share2, 
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const HomePage: React.FC = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "AI-Powered Summaries",
      description: "Advanced AI analyzes video content to generate accurate, concise summaries"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Save Time",
      description: "Get key insights from hours of content in just minutes"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Multiple Formats",
      description: "Choose from bullet points, paragraphs, or detailed chapter breakdowns"
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "Export Options",
      description: "Export summaries as PDF, text, or markdown for easy sharing"
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Share summaries with your team and collaborate on insights"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Bookmark & Organize",
      description: "Save important summaries and organize them by categories"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Content Creator",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      content: "This tool has revolutionized how I research content. I can quickly understand what competitors are doing without watching hours of videos."
    },
    {
      name: "Mike Chen",
      role: "Student",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
      content: "Perfect for studying! I can summarize educational videos and focus on the most important concepts. Saves me so much time."
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Manager",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
      content: "Our team uses this to stay updated on industry trends. The summaries are accurate and help us make informed decisions quickly."
    }
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration - moved to back with lower z-index */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative z-10">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
            >
              Transform YouTube Videos into
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {" "}Actionable Summaries
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              Save hours of watching time. Get AI-powered summaries of any YouTube video in seconds. 
              Perfect for students, professionals, and content creators.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-20"
            >
              <Link
                to="/summarize"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105 transform cursor-pointer"
              >
                <Play className="w-5 h-5" />
                <span>Start Summarizing</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="border border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-200 hover:scale-105 transform cursor-pointer">
                Watch Demo
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need to summarize videos
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Powerful features designed to help you extract maximum value from video content
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-200"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-300">
              Get your video summary in just 3 simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Paste YouTube URL",
                description: "Simply paste any YouTube video URL into our summarizer"
              },
              {
                step: "2",
                title: "AI Analysis",
                description: "Our AI analyzes the video content and extracts key insights"
              },
              {
                step: "3",
                title: "Get Summary",
                description: "Receive a comprehensive summary with key points and timestamps"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-300">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What our users say
            </h2>
            <p className="text-xl text-gray-300">
              Trusted by thousands of professionals worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-300 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300">{testimonial.content}</p>
                <div className="flex text-yellow-400 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-md rounded-3xl p-12 text-center border border-white/20 relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to save hours of watching time?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already using YTVideoSummarizer to boost their productivity
            </p>
            <Link
              to="/summarize"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 inline-flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105 transform cursor-pointer relative z-10"
            >
              <Play className="w-5 h-5" />
              <span>Get Started Free</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;