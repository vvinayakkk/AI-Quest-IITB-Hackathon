import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SearchIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HomePost = ({ post }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {post.author?.avatar && (
            <img 
              src={post.author.avatar} 
              alt={post.author.name} 
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div>
            <p className="text-white font-medium">{post.author?.name || 'Unknown Author'}</p>
            <p className="text-gray-400 text-sm">{post.createdAt}</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white">{post.title}</h2>
      
      {post.images && post.images.length > 0 && (
        <div className="mt-4">
          <img 
            src={post.images[0].url} 
            alt={post.title} 
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}

      <p className="text-gray-300 line-clamp-3">{post.content}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 text-gray-400 hover:text-white">
            <span>Like</span>
            <span>{post.likes?.length || 0}</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-400 hover:text-white">
            <span>Comments</span>
            <span>{post.comments?.length || 0}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch posts from backend
  const fetchPosts = async (search = '') => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/post', {
        params: { search }
      });

      setPosts(response.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Detailed error:', err);
      setError(err.response?.data?.message || 'Failed to fetch posts');
      setLoading(false);
      setPosts([]); 
    }
  };

  // Search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPosts(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <p className="text-white">Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-4 sm:py-8 px-3 sm:px-4 text-red-500 bg-gray-900 min-h-screen">
        <p>Error: {error}</p>
        <button 
          onClick={() => fetchPosts()}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded"
        >
          Retry Fetching Posts
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 px-3 sm:px-4 bg-gray-900 min-h-screen">
      <div className="mb-6 sm:mb-8 sticky top-0 z-10">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search posts..."
            className="w-full px-4 py-2 sm:py-3 pl-10 sm:pl-12 rounded-xl
                     bg-gray-800/95 border border-purple-500/20
                     text-white placeholder-gray-400
                     focus:outline-none focus:border-purple-500
                     focus:ring-2 focus:ring-purple-500/20
                     transition-all duration-300
                     backdrop-blur-sm"
          />
          <SearchIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" 
                     size={18} />
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <p className="text-gray-400">
              {searchTerm 
                ? `No posts found matching "${searchTerm}"` 
                : "No posts available"}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {posts.map(post => (
              <HomePost 
                key={post._id || Math.random().toString()} 
                post={post} 
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;