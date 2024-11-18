import React, { useState } from 'react';
import { ArrowUpIcon, ArrowDownIcon, MessageSquareIcon, UserCircle2, SearchIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SAMPLE_POSTS from '@/assets/SAMPLE_POSTS.json';


const Post = ({ post, searchTerm }) => {
  const [votes, setVotes] = useState(post.votes);
  const [showReplies, setShowReplies] = useState(false);
  const [newReply, setNewReply] = useState("");
  const [replies, setReplies] = useState(post.replies);
  const [voteStatus, setVoteStatus] = useState(null);

  const handleVote = (type) => {
    if (voteStatus === type) {
      setVotes(prev => type === 'up' ? prev - 1 : prev + 1);
      setVoteStatus(null);
    } else {
      setVotes(prev => {
        if (voteStatus) {
          return type === 'up' ? prev + 2 : prev - 2;
        }
        return type === 'up' ? prev + 1 : prev - 1;
      });
      setVoteStatus(type);
    }
  };

  const handleAddReply = (e) => {
    e.preventDefault();
    if (!newReply.trim()) return;
    
    const reply = {
      id: replies.length + 1,
      username: "currentUser",
      content: newReply,
      time: "Just now"
    };
    
    setReplies([...replies, reply]);
    setNewReply("");
  };

  const highlightText = (text) => {
    if (!searchTerm) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === searchTerm.toLowerCase() ? 
        <span key={index} className="bg-accent/30 text-accent font-semibold">{part}</span> : part
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background border border-primary/20 rounded-xl p-6 mb-6
                shadow-[0_4px_20px_-4px_hsl(223,90%,73%/0.3)]
                hover:shadow-[0_4px_20px_-4px_hsl(223,90%,73%/0.5)]
                transition-all duration-300"
    >
      <div className="flex gap-6">
        {/* Vote buttons */}
        <div className="flex flex-col items-center">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => handleVote('up')} 
            className={`p-2 rounded-full transition-colors ${
              voteStatus === 'up' ? 'text-primary bg-primary/20' : 'text-text/50 hover:text-primary'
            }`}
          >
            <ArrowUpIcon size={20} />
          </motion.button>
          <span className="my-1 font-bold text-lg">{votes}</span>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => handleVote('down')} 
            className={`p-2 rounded-full transition-colors ${
              voteStatus === 'down' ? 'text-accent bg-accent/20' : 'text-text/50 hover:text-accent'
            }`}
          >
            <ArrowDownIcon size={20} />
          </motion.button>
        </div>

        {/* Post content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={post.avatar} 
              alt={`${post.username}'s avatar`}
              className="w-8 h-8 rounded-full border border-primary/20"
            />
            <div>
              <h3 className="font-semibold text-text">{post.username}</h3>
              <span className="text-sm text-text/60">{post.time}</span>
            </div>
          </div>

          <p className="text-text text-lg mb-4">{highlightText(post.content)}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map(tag => (
              <span 
                key={tag} 
                className="px-3 py-0.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-secondary"
              >
                #{tag}
              </span>
            ))}
            <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
              {post.category}
            </span>
          </div>

          <button 
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-2 text-text/60 hover:text-primary transition-colors"
          >
            <MessageSquareIcon size={18} />
            <span>{replies.length} replies</span>
          </button>

          <AnimatePresence>
            {showReplies && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pl-6 border-l-2 border-primary/20"
              >
                {replies.map(reply => (
                  <motion.div 
                    key={reply.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text">{reply.username}</span>
                      <span className="text-sm text-text/60">{reply.time}</span>
                    </div>
                    <p className="text-text/80 mt-1">{highlightText(reply.content)}</p>
                  </motion.div>
                ))}
                
                <form onSubmit={handleAddReply} className="mt-4">
                  <input
                    type="text"
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full px-4 py-2 rounded-lg bg-background
                             border border-primary/20 text-text
                             placeholder:text-text/40
                             focus:outline-none focus:border-primary
                             focus:ring-2 focus:ring-primary/20
                             transition-all duration-200"
                  />
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredPosts = SAMPLE_POSTS
    .filter(post => {
      const searchContent = [
        post.content,
        post.username,
        post.category,
        ...post.tags,
        ...post.replies.map(reply => reply.content)
      ].join(' ').toLowerCase();
      
      return searchContent.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => b.votes - a.votes);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8 relative">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search posts, tags, or categories..."
            className="w-full px-4 py-3 pl-12 rounded-xl
                     bg-primary/50 border border-primary/20
                     text-text placeholder-text/50
                     focus:outline-none focus:border-primary
                     focus:ring-2 focus:ring-primary/20
                     transition-all duration-300
                     backdrop-blur-sm"
          />
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text/50" size={20} />
        </div>
        
        {searchTerm && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-text/70">
            {filteredPosts.length} results
          </div>
        )}
      </div>

      <AnimatePresence>
        {searchTerm && filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <p className="text-text/70">No posts found matching "{searchTerm}"</p>
          </motion.div>
        ) : (
          filteredPosts.map(post => (
            <Post key={post.id} post={post} searchTerm={searchTerm} />
          ))
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;