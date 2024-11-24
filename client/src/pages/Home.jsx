import React, { useState } from 'react';
import HomePost from "@/components/post/HomePost"

import { SearchIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { samplePosts } from "@/assets/sampleData"

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [posts] = useState(samplePosts);
  
  const filteredPosts = posts.filter(post => {
    if (!searchTerm.trim()) return true;
    
    const searchContent = [
      post.title,
      post.content,
      post.author.name,
      ...(post.categories || []),
      ...(post.tags || []),
    ].join(' ').toLowerCase();
    
    return searchContent.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 px-3 sm:px-4">
      <div className="mb-6 sm:mb-8 sticky top-0 z-10">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search posts..."
            className="w-full px-4 py-2 sm:py-3 pl-10 sm:pl-12 rounded-xl
                     bg-gray-900/95 border border-purple-500/20
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
        {filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <p className="text-gray-400">No posts found matching "{searchTerm}"</p>
          </motion.div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {filteredPosts.map(post => (
              <HomePost key={post.id} post={post} />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;