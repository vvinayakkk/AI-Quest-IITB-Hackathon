import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Users, MessageCircle, Award, Search, Github, BookOpen, ChevronRight, Star, Shield, Brain } from 'lucide-react';

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

const ParticleBackground = () => {
  const containerRef = useRef();
  const mousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 5;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.005,
      color: '#4f46e5',
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 2;

    // Mouse movement handler
    const onMouseMove = (event) => {
      mousePosition.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      };
    };

    window.addEventListener('mousemove', onMouseMove);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      particlesMesh.rotation.x += 0.0005;
      particlesMesh.rotation.y += 0.0005;

      // Response to mouse movement
      particlesMesh.rotation.x += mousePosition.current.y * 0.0001;
      particlesMesh.rotation.y += mousePosition.current.x * 0.0001;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 -z-10" />;
};

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <ParticleBackground />

      {/* Navbar */}
      <nav className="fixed w-full z-10 bg-black/20 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                KnowledgeHub
              </span>
            </div>
            <div className="flex items-center">
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-105 transition-all duration-300 shadow-lg shadow-indigo-500/25">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-7xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
              Next-Gen Knowledge Sharing
            </h1>
            <p className="text-xl text-center mb-8 text-gray-400 max-w-2xl mx-auto">
              Harness the power of AI to transform your team's knowledge sharing
            </p>
            <div className="flex justify-center space-x-4">
              <button className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:scale-105 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center group">
                Get Started 
                <ChevronRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 rounded-lg border border-gray-700 hover:border-indigo-500 transition-all duration-300 hover:scale-105">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Users size={24} />, label: 'Active Users', value: '5,000+' },
              { icon: <MessageCircle size={24} />, label: 'Questions Asked', value: '15,000+' },
              { icon: <Award size={24} />, label: 'Verified Answers', value: '25,000+' }
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-black/40 p-8 rounded-2xl backdrop-blur-xl border border-gray-800 hover:scale-105 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-indigo-500 transform group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-gray-400">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
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
                className="bg-black/40 backdrop-blur-xl border border-gray-800 p-8 rounded-2xl group transform hover:-translate-y-2 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="text-indigo-500 bg-indigo-500/10 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="bg-black/40 backdrop-blur-xl border border-gray-800 p-8 rounded-2xl transform hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={16} className="fill-current text-indigo-500 group-hover:scale-110 transition-transform" />
                    ))}
                  </div>
                  <p className="text-gray-400 italic">{review.content}</p>
                  <div>
                    <div className="font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
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

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;