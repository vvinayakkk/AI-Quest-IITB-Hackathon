import { useState, useEffect } from 'react';
import { SearchIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Post from '@/components/post/Post';
import axios from 'axios';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch posts from backend with search
  const fetchPosts = async (search = '') => {
    try {
      setLoading(true);
      const response = await axios.get(`${SERVER_URL}/post`, {
        params: { search },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Fetched posts:', response.data.data);

      setPosts(response.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Detailed error:', err);
      setError(err.response?.data?.message || 'Failed to fetch posts');
      setLoading(false);
      setPosts([]);
    }
  };

  // Search debounce effect
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

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500"></div>
        <p className="text-white ml-4">Loading posts...</p>
      </div>
    );
  }

  // Error state
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
      {/* Search Input */}
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
          <SearchIcon
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
      </div>

      {/* Posts List */}
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
              <Post
                key={post._id}
                post={post}
                setPosts={setPosts}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;