import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardHeader } from "@/components/ui/card"
import { formatTimeAgo, formatUTCTimestamp } from "@/utils/dateUtils"
import ImageGallery from "./ImageGallery"

export default function Post({ post }) {
  if (!post) return null; // Add null check

  const parseMentionsAndHashtags = (text) => {
    if (!text) return ''; // Add null check for text
    return text.split(/(\s+)/).map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-accent hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      if (part.startsWith('#')) {
        return (
          <span key={index} className="text-primary hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="hover:shadow-lg hover:shadow-purple-500/10 transition-shadow duration-300"
    >
      <Card className="bg-gray-900/95 border-purple-500/20 backdrop-blur">
        <CardHeader className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 rounded-xl border-2 border-purple-500/20">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback>{post.author.initials}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2 leading-tight break-words">
                {parseMentionsAndHashtags(post.title)}
              </h2>
              
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  Posted by {post.author.name}
                </span>
                {post.department && (
                  <>
                    <span>•</span>
                    <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                      {post.department}
                    </span>
                  </>
                )}
                <span>•</span>
                <span title={formatUTCTimestamp(post.timestamp)}>
                  {formatTimeAgo(post.timestamp)}
                </span>
              </div>

              <div className="mb-4 text-gray-200">
                {parseMentionsAndHashtags(post.content)}
              </div>

              {post.images && post.images.length > 0 && (
                <ImageGallery images={post.images} />
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                {/* Categories */}
                {post.categories?.map(category => (
                  <span key={category}
                    className="px-3 py-1 rounded-full text-sm font-medium
                             bg-accent/10 text-accent 
                             hover:bg-accent/20 transition-colors cursor-pointer"
                  >
                    {category}
                  </span>
                ))}
                
                {/* Tags */}
                {post.tags?.map(tag => (
                  <span key={tag} 
                    className="px-3 py-1 rounded-full text-sm font-medium
                             bg-purple-500/10 text-purple-400 
                             hover:bg-purple-500/20 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  )
}