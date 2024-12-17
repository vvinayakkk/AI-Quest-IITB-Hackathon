import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Post from '@/components/post/Post';
import axios from 'axios';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const SORT_OPTIONS = {
  NONE: 'none',
  ASC: 'ascending',
  DESC: 'descending'
};

const MyPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortByLikes, setSortByLikes] = useState(SORT_OPTIONS.NONE);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${SERVER_URL}/user/posts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      setSelectedTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  // Display filtered and sorted posts
  const getDisplayedPosts = () => {
    let filteredPosts = [...posts];
    
    if (selectedTags.length > 0) {
      filteredPosts = filteredPosts.filter(post => 
        post.tags?.some(tag => selectedTags.includes(tag))
      );
    }

    if (sortByLikes !== SORT_OPTIONS.NONE) {
      filteredPosts.sort((a, b) => {
        const comparison = a.likes.length - b.likes.length;
        return sortByLikes === SORT_OPTIONS.ASC ? comparison : -comparison;
      });
    }

    return filteredPosts;
  };

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
      {/* Controls */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={sortByLikes}
            onChange={(e) => setSortByLikes(e.target.value)}
            className="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors"
          >
            <option value={SORT_OPTIONS.NONE}>Sort by Likes</option>
            <option value={SORT_OPTIONS.ASC}>Likes: Low to High</option>
            <option value={SORT_OPTIONS.DESC}>Likes: High to Low</option>
          </select>

          <form onSubmit={handleAddTag} className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tag to filter..."
              className="px-4 py-2 rounded bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              Add
            </button>
          </form>
        </div>

        {/* Selected Tags Display */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full 
                         flex items-center gap-2"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="hover:text-white focus:outline-none"
                >
                  ×
                </button>
              </span>
            ))}
            <button
              onClick={() => setSelectedTags([])}
              className="px-3 py-1 text-sm text-purple-400 hover:text-purple-300"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Posts List */}
      <AnimatePresence mode="popLayout">
        {getDisplayedPosts().length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <p className="text-gray-400">
              No posts found
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {getDisplayedPosts().map(post => (
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

export default MyPostsPage;