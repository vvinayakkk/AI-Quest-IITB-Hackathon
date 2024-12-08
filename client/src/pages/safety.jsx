import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { SearchIcon, ThumbsUpIcon, MessageCircleIcon, SendIcon , PlusIcon} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext,useAuth } from '../context/AuthContext'; // Assume you have an AuthContext

const CommentSection = ({ postId, comments, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(
        `http://localhost:3000/post/${postId}/comment`, 
        { content: newComment },
        {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          }
        }
      );

      if (response.data.success) {
        onAddComment(response.data.data);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      // Implement error handling (e.g., toast notification)
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="space-y-2">
        {comments.map(comment => (
          <div key={comment._id} className="flex items-start space-x-2">
            {comment.user?.avatar && (
              <img 
                src={comment.user.avatar} 
                alt={`${comment.user.firstName} ${comment.user.lastName}`} 
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <div className="bg-gray-700 rounded-lg px-3 py-2">
              <p className="text-white font-medium text-sm">
                {comment.user 
                  ? `${comment.user.firstName} ${comment.user.lastName}` 
                  : 'Unknown User'}
              </p>
              <p className="text-gray-300 text-sm">{comment.content}</p>
              <p className="text-gray-500 text-xs">
                {new Date(comment.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmitComment} className="flex items-center space-x-2">
        <input 
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-grow px-3 py-2 rounded-lg bg-gray-800 text-white 
                     placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button 
          type="submit" 
          className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 
                     transition-colors disabled:opacity-50"
          disabled={!newComment.trim()}
        >
          <SendIcon size={18} />
        </button>
      </form>
    </div>
  );
};

const HomePost = ({ post, onLikeToggle }) => {
  const [showComments, setShowComments] = useState(false);
  const [localPost, setLocalPost] = useState(post);
  const { user } = useContext(AuthContext);

  const handleLikeToggle = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3000/post/${post._id}/like`,
        {},
        {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          }
        }
      );
      
      if (response.data.success) {
        setLocalPost(prev => ({
          ...prev,
          likes: response.data.data.isLiked 
            ? [...(prev.likes || []), user.id] 
            : (prev.likes || []).filter(id => id !== user.id)
        }));
        onLikeToggle?.(post._id, response.data.data);
      }
    } catch (error) {
      console.error('Like toggle failed:', error);
      // Implement error handling
    }
  };

  const handleAddComment = (newComment) => {
    setLocalPost(prev => ({
      ...prev,
      comments: [...(prev.comments || []), newComment]
    }));
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {localPost.author?.avatar && (
            <img 
              src={localPost.author.avatar} 
              alt={`${localPost.author.firstName} ${localPost.author.lastName}`} 
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div>
            <p className="text-white font-medium">
              {localPost.author 
                ? `${localPost.author.firstName} ${localPost.author.lastName}` 
                : 'Unknown Author'}
            </p>
            <p className="text-gray-400 text-sm">
              {new Date(localPost.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white">{localPost.title}</h2>
      
      {localPost.images && localPost.images.length > 0 && (
        <div className="mt-4">
          <img 
            src={localPost.images[0].url || `data:image/jpeg;base64,${localPost.images[0].data}`} 
            alt={localPost.title} 
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}

      <p className="text-gray-300 line-clamp-3">{localPost.content}</p>

      {localPost.tags && localPost.tags.length > 0 && (
        <div className="flex space-x-2">
          {localPost.tags.map(tag => (
            <span 
              key={tag} 
              className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleLikeToggle}
            className="flex items-center space-x-2 text-gray-400 hover:text-white"
          >
            <ThumbsUpIcon 
              className={`${localPost.likes?.includes(user.id) ? 'text-purple-500 fill-current' : ''}`} 
              size={18} 
            />
            <span>{localPost.likes?.length || 0}</span>
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-400 hover:text-white"
          >
            <MessageCircleIcon size={18} />
            <span>{localPost.comments?.length || 0}</span>
          </button>
        </div>
      </div>

      {showComments && (
        <CommentSection 
          postId={localPost._id} 
          comments={localPost.comments || []} 
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
};

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  // Fetch posts from backend
  const fetchPosts = async (search = '', page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/post', {
        params: { search, page },
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });

      setPosts(response.data.data || []);
      setPagination({
        currentPage: response.data.pagination.currentPage,
        totalPages: response.data.pagination.totalPages,
        hasNextPage: response.data.pagination.hasNextPage,
        hasPrevPage: response.data.pagination.hasPrevPage
      });
      setLoading(false);
    } catch (err) {
      console.error('Detailed error:', err);
      setError(err.response?.data?.message || 'Failed to fetch posts');
      setLoading(false);
      setPosts([]); 
    }
  };

  // Handle like toggle in the posts list
  const handleLikeToggle = (postId, likeData) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post._id === postId 
          ? { ...post, likes: likeData.isLiked 
              ? [...(post.likes || []), user.id] 
              : (post.likes || []).filter(id => id !== user.id) }
          : post
      )
    );
  }

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      fetchPosts(searchTerm, pagination.currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination.hasPrevPage) {
      fetchPosts(searchTerm, pagination.currentPage - 1);
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
          <>
            <div className="space-y-4 sm:space-y-6">
              {posts.map(post => (
                <HomePost 
                  key={post._id} 
                  post={post} 
                  onLikeToggle={handleLikeToggle}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center space-x-4 mt-6">
              <button
                onClick={handlePrevPage}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 bg-purple-600 text-white rounded 
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-white">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 bg-purple-600 text-white rounded 
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Create Post Button */}
      <div className="fixed bottom-6 right-6 z-20">
        <button 
          onClick={() => navigate('/create-post')} 
          className="bg-purple-600 text-white p-4 rounded-full 
                     shadow-lg hover:bg-purple-700 transition-colors 
                     flex items-center justify-center"
        >
          <PlusIcon size={24} />
        </button>
      </div>
    </div>
  );
};

export default Home;