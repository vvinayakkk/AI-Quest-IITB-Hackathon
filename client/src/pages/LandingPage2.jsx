import React, { useState, useEffect } from 'react';
import { Sun, Moon, Users, MessageCircle, Award, Search, Github, BookOpen, ChevronRight, Star, Shield, Brain } from 'lucide-react';

const reviews = [
  {
    name: "Sarah Johnson",
    role: "Engineering Lead",
    content: "KnowledgeHub has transformed how our team shares information. The AI-powered responses are incredibly accurate.",
    rating: 5
  },
  {
    name: "Mark Anderson",
    role: "Product Manager",
    content: "The official answers feature ensures we always have accurate information. Great for maintaining knowledge consistency.",
    rating: 5
  },
  {
    name: "Lisa Chen",
    role: "Senior Developer",
    content: "Integration with our GitHub repos makes it super easy to reference documentation. Best knowledge sharing tool we've used.",
    rating: 4
  }
];

const LandingPage = () => {
  const [isDark, setIsDark] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    setIsVisible(true);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const parallaxOffset = -scrollY * 0.5;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} transition-colors duration-300`}>
      {/* Modern Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className={`absolute inset-0 ${isDark ? 'bg-gray-900' : 'bg-blue-50'}`}>
          <div className="absolute inset-0 opacity-20">
            {/* Modern gradient mesh */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 opacity-30 animate-gradient"></div>
            {/* Floating elements */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
            <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-float-delayed"></div>
            {/* Animated grid */}
            <div 
              className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)]" 
              style={{
                backgroundSize: '40px 40px',
                transform: `translateY(${parallaxOffset}px)`,
                opacity: 0.1
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Glass Navbar */}
      <nav className={`${isDark ? 'bg-gray-800/70' : 'bg-white/70'} backdrop-blur-xl border-b ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'} fixed w-full z-10 transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                KnowledgeHub
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsDark(!isDark)}
                className={`p-2 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100/50'} backdrop-blur-sm hover:scale-110 transition-all duration-300`}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/25">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Floating Elements */}
      <div className="pt-32 pb-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-6xl font-bold text-center mb-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Your AI-Powered Knowledge Sharing Platform
            </h1>
            <p className="text-xl text-center mb-8 text-gray-500 max-w-2xl mx-auto">
              Connect, Learn, and Share Knowledge with Intelligent Insights
            </p>
            <div className="flex justify-center space-x-4">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 flex items-center group">
                Get Started 
                <ChevronRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
              </button>
              <button className={`px-8 py-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} hover:border-blue-500 transition-all duration-300 hover:scale-105`}>
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Stats Section */}
      <div className={`py-16 ${isDark ? 'bg-gray-800/30' : 'bg-gray-50/30'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Users size={24} />, label: 'Active Users', value: '5,000+' },
              { icon: <MessageCircle size={24} />, label: 'Questions Asked', value: '15,000+' },
              { icon: <Award size={24} />, label: 'Verified Answers', value: '25,000+' }
            ].map((stat, index) => (
              <div
                key={index}
                className={`${isDark ? 'bg-gray-700/50' : 'bg-white/50'} p-8 rounded-2xl shadow-lg backdrop-blur-sm hover:scale-105 transition-all duration-300 group`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-blue-500 transform group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-gray-500">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid with Hover Effects */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Brain size={24} />, 
                title: 'AI-Powered Answers', 
                description: 'Get intelligent responses based on your organizations knowledge base' 
              },
              { 
                icon: <Shield size={24} />, 
                title: 'Official Verification', 
                description: 'Designated experts provide and verify authoritative answers' 
              },
              { 
                icon: <Github size={24} />, 
                title: 'GitHub Integration', 
                description: 'Seamlessly connect with your repositories and documentation' 
              },
              { 
                icon: <Search size={24} />, 
                title: 'Smart Search', 
                description: 'Find answers quickly with our advanced search capabilities' 
              },
              { 
                icon: <MessageCircle size={24} />, 
                title: 'Real-time Collaboration', 
                description: 'Ask questions and get answers from your entire team' 
              },
              { 
                icon: <BookOpen size={24} />, 
                title: 'Knowledge Base', 
                description: 'Build a comprehensive library of verified solutions' 
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`${isDark ? 'bg-gray-800/30' : 'bg-gray-50/30'} backdrop-blur-sm p-8 rounded-2xl group hover:bg-gradient-to-br from-blue-500/10 to-purple-600/10 transform hover:-translate-y-2 transition-all duration-300`}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="text-blue-500 bg-blue-100 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-500">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section with Card Animations */}
      <div className={`py-16 ${isDark ? 'bg-gray-800/30' : 'bg-gray-50/30'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <div
                key={index}
                className={`${isDark ? 'bg-gray-700/50' : 'bg-white/50'} p-8 rounded-2xl shadow-lg backdrop-blur-sm transform hover:-translate-y-2 transition-all duration-300 group`}
              >
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={16} className="fill-current text-yellow-400 group-hover:scale-110 transition-transform" />
                    ))}
                  </div>
                  <p className="text-gray-500 italic">{review.content}</p>
                  <div>
                    <div className="font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                      {review.name}
                    </div>
                    <div className="text-sm text-gray-500">{review.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes float {
          0% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(20px); }
          100% { transform: translateY(0px) translateX(0px); }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float 6s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;