import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatTimeAgo, formatUTCTimestamp } from "@/utils/dateUtils"
import { MessageSquare, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import ImageGallery from "./ImageGallery"

export default function HomePost({ post }) {
  if (!post) return null;
  const author = post.author || {};

  const parseMentionsAndHashtags = (text) => {
    if (!text) return '';
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
      className="group"
    >
      <Card className="bg-gray-900/95 border-purple-500/20 backdrop-blur hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 text-text">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl border-2 border-purple-500/20">
              <AvatarImage src={author.avatar} />
              <AvatarFallback>{author.initials}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <Link to={`/post/${post.id}`}>
                <h2 className="text-lg sm:text-xl font-bold text-white leading-tight break-words 
                             group-hover:text-primary transition-colors">
                  {parseMentionsAndHashtags(post.title)}
                </h2>
              </Link>
              
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                <span>
                  Posted by <span className="text-accent hover:underline cursor-pointer">{author.name}</span>
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

              <div className="text-gray-200 line-clamp-3 text-sm sm:text-base">
                {parseMentionsAndHashtags(post.content)}
              </div>

              {post.images && post.images.length > 0 && (
                <div className="pt-2">
                  <ImageGallery images={post.images} />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">{post.replies?.length || 0} replies</span>
                </div>

                <Link to={`/post/${post.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-500/20 text-primary hover:bg-primary/10"
                  >
                    Read More
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {(post.categories?.length > 0 || post.tags?.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {post.categories?.slice(0, 2).map(category => (
                    <span key={category}
                      className="px-2 py-0.5 rounded-full text-xs font-medium
                               bg-accent/10 text-accent"
                    >
                      {category}
                    </span>
                  ))}
                  
                  {post.tags?.slice(0, 3).map(tag => (
                    <span key={tag} 
                      className="px-2 py-0.5 rounded-full text-xs font-medium
                               bg-purple-500/10 text-purple-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  )
}