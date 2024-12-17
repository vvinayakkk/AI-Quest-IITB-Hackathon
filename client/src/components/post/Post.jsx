import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Trash2, Bookmark, BookmarkCheck, ThumbsUp, MessageCircle } from "lucide-react"
import { useUser } from "@/providers/UserProvider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatTimeAgo, formatUTCTimestamp } from "@/utils/dateUtils"
import ImageGallery from "./ImageGallery"

const parseHashtags = (text = '') => {
  return text.split(/(\s+)/).map((part, index) =>
    part.startsWith('#') ? (
      <span key={index} className="text-accent hover:underline cursor-pointer">
        {part}
      </span>
    ) : part
  );  
};

const Post = ({ post, setPosts }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes.length || 0);

  if (!post) return null;

  const hasCategories = post.categories?.length > 0;
  const hasTags = post.tags?.length > 0;
  const hasImages = post.images?.length > 0;

  const handleBookmark = async () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Implement bookmark API call
  };

  const handleLike =async  () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    // TODO: Implement like API call
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      // await axios.delete(`${SERVER_URL}/post/${post._id}`, {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // });
      
      setPosts(prevPosts => prevPosts.filter(p => p._id !== post._id));
      // TODO: Add success toast notification
    } catch (error) {
      console.error('Failed to delete post:', error);
      // TODO: Add error toast notification
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="hover:shadow-xl hover:shadow-purple-500/20 hover:scale-[1.01] transition-all duration-300"
    >
      <Card className="bg-gray-900/95 border-purple-500/20 backdrop-blur relative hover:border-purple-500/40">
        {/* Top right actions */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <Button
            variant="ghost"
            size="sm"
            className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 transition-all"
            onClick={handleBookmark}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-5 w-5 fill-purple-400" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>

          {((post.author._id === user._id) || (["Admin", "Moderator"].includes(user.role))) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all"
              onClick={handleDeletePost}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>

        <CardHeader className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 rounded-xl border-2 border-purple-500/20">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback>{post.author?.fullName[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2 leading-tight break-words">
                {parseHashtags(post.title)}
              </h2>

              {/* Author Info */}
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <span>Posted by {post.author?.fullName}</span>
                {post.author?.department && (
                  <>
                    <span>•</span>
                    <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                      {post.author?.department}
                    </span>
                  </>
                )}
                <span>•</span>
                <span title={formatUTCTimestamp(post.createdAt)}>
                  {formatTimeAgo(post.createdAt)}
                </span>
              </div>

              <div className="mb-4 text-gray-200">
                {parseHashtags(post.content)}
              </div>

              {hasImages && <ImageGallery images={post.images} />}

              {/* Like button and tags section */}
              <div className="mt-4 space-y-4">
                {(hasCategories || hasTags) && (
                  <div className="flex flex-wrap gap-2">
                    {hasCategories && post.categories.map(category => (
                      <span key={category}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors cursor-pointer"
                      >
                        {category}
                      </span>
                    ))}

                    {hasTags && post.tags.map(tag => (
                      <span key={tag}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`transition-all hover:bg-white/10 text-white`}
                    onClick={handleLike}
                  >
                    <ThumbsUp 
                      className={`h-5 w-5 mr-1 ${isLiked ? 'fill-white' : ''}`}
                    />
                    <span>{likeCount}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="transition-all hover:bg-white/10 text-white"
                    onClick={() => navigate(`/post/${post._id}`)}
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  );
};

export default Post;
