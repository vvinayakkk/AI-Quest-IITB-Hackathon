import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  SearchIcon, 
  ThumbsUpIcon, 
  MessageCircleIcon, 
  SendIcon, 
  PlusIcon,
  XIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

// Comment Section Component
const CommentSection = ({ postId, comments, onAddComment }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(
        `${SERVER_URL}/post/${postId}/comment`, 
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
      // TODO: Implement proper error handling (e.g., toast notification)
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="space-y-2">
        {comments && comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment._id} className="flex items-start space-x-2">
              {comment.user && comment.user.avatar && (
                <img 
                  src={comment.user.avatar} 
                  alt={`${comment.user.firstName} ${comment.user.lastName}`} 
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <div className="bg-gray-700 rounded-lg px-3 py-2 flex-grow">
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
          ))
        ) : (
          <p className="text-gray-400 text-center">No comments yet</p>
        )}
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

// New ImageGrid component to replace ImageCarousel
const ImageGrid = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const getGridClass = (length) => {
    switch (length) {
      case 1: return "grid-cols-1 max-w-md mx-auto";
      case 2: return "grid-cols-2";
      case 3: return "grid-cols-3";
      default: return "grid-cols-4";
    }
  };

  return (
    <>
      <div className={`grid ${getGridClass(images.length)} gap-2 mt-4`}>
        {images.slice(0, 4).map((image, index) => (
          <div 
            key={image.id} 
            className="relative cursor-pointer aspect-[3/4]"
            onClick={(e) => {
              e.stopPropagation(); // Prevent post navigation
              setSelectedImage(image);
            }}
          >
            <img 
              src={image.data} 
              alt={`Post image ${index + 1}`} 
              className="w-full h-full object-cover rounded-lg"
            />
            {index === 3 && images.length > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <span className="text-white text-xl font-bold">
                  +{images.length - 4}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Full-size Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedImage(null);
          }}
        >
          <button 
            className="absolute top-4 right-4 text-white p-2"
            onClick={() => setSelectedImage(null)}
          >
            <XIcon size={24} />
          </button>
          <img 
            src={selectedImage.data} 
            alt="Full size"
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}
    </>
  );
};

// Individual Post Component
const HomePost = ({ post, onLikeToggle, onAddComment }) => {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [localPost, setLocalPost] = useState(post);

  const handleLikeToggle = async () => {
    try {
      const response = await axios.post(
        `${SERVER_URL}/post/${post._id}/like`,
        {},
        {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          }
        }
      );
      
      if (response.data.success) {
        const updatedPost = {
          ...localPost,
          likes: response.data.data.isLiked 
            ? [...(localPost.likes || []), response.data.data.userId] 
            : (localPost.likes || []).filter(id => id !== response.data.data.userId)
        };
        
        setLocalPost(updatedPost);
        onLikeToggle?.(post._id, response.data.data);
      }
    } catch (error) {
      console.error('Like toggle failed:', error);
    }
  };

  const handleAddComment = (newComment) => {
    const updatedPost = {
      ...localPost,
      comments: [...(localPost.comments || []), newComment]
    };
    
    setLocalPost(updatedPost);
    onAddComment?.(post._id, newComment);
  };

  const handlePostClick = () => {
    navigate(`/post/${post._id}`);
  };

  const handleActionClick = (e) => {
    e.stopPropagation(); // Prevent navigation when clicking actions
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800 rounded-lg p-4 space-y-3 cursor-pointer 
                hover:bg-gray-750 transition-colors duration-200"
      onClick={handlePostClick}
    >
      {/* Post Header */}
      <div className="flex items-center justify-between" onClick={handleActionClick}>
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

      {/* Post Content */}
      <h2 className="text-xl font-bold text-white">{localPost.title}</h2>
      <p className="text-gray-300">{localPost.content}</p>

      {localPost.images && localPost.images.length > 0 && (
        <div onClick={handleActionClick}>
          <ImageGrid images={localPost.images} />
        </div>
      )}

      {/* Tags */}
      <div onClick={handleActionClick}>
        {localPost.tags && localPost.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
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
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between" onClick={handleActionClick}>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleLikeToggle}
            className="flex items-center space-x-2 text-gray-400 hover:text-white"
          >
            <ThumbsUpIcon 
              className={
                localPost.likes?.includes(localStorage.getItem('userId'))
                  ? 'text-purple-500 fill-current' 
                  : ''
              } 
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

      {/* Comments Section */}
      {showComments && (
        <div onClick={handleActionClick}>
          <CommentSection 
            postId={localPost._id} 
            comments={localPost.comments || []} 
            onAddComment={handleAddComment}
          />
        </div>
      )}
    </motion.div>
  );
};

// Main Home Component
const Home = () => {
  const navigate = useNavigate();
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

  // Handle like toggle in the posts list
  const handleLikeToggle = (postId, likeData) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              likes: likeData.isLiked 
                ? [...(post.likes || []), likeData.userId] 
                : (post.likes || []).filter(id => id !== likeData.userId) 
            }
          : post
      )
    );
  };

  // Handle adding comment to a post
  const handleAddComment = (postId, newComment) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              comments: [...(post.comments || []), newComment] 
            }
          : post
      )
    );
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
              <HomePost 
                key={post._id} 
                post={post} 
                onLikeToggle={handleLikeToggle}
                onAddComment={handleAddComment}
              />
            ))}
          </div>
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