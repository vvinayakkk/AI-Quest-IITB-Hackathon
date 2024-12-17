import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Trash2, Bookmark, BookmarkCheck, ThumbsUp, MessageCircle, Flag, BadgeCheck } from "lucide-react"
import { useUser } from "@/providers/UserProvider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatTimeAgo, formatUTCTimestamp } from "@/utils/dateUtils"
import ImageGallery from "./ImageGallery"
import axios from "axios"
import { toast } from "sonner"
import { CommentDialog } from "./CommentDialog"
import { parseHashtags } from "@/utils/hashtagUtils"


const Post = ({ post, setPosts, handleAddComment, commentRedirect = true }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(user.bookmarks?.includes(post._id));
  const [isLiked, setIsLiked] = useState(post.likes.includes(user._id));
  const [likeCount, setLikeCount] = useState(post.likes.length || 0);
  const [showCommentDialog, setShowCommentDialog] = useState(false)

  if (!post) return null;

  const hasCategories = post.categories?.length > 0;
  const hasTags = post.tags?.length > 0;
  const hasImages = post.images?.length > 0;

  const SERVER_URL = import.meta.env.VITE_SERVER_URL;

  const handleBookmark = async () => {
    try {
      setIsBookmarked(!isBookmarked);
      const response = await axios.post(`${SERVER_URL}/user/add-bookmark`, {
        postId: post._id
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        toast.success(isBookmarked ? "Bookmark Removed" : "Post Bookmarked", {
          description: response.data.message
        });
      }
    } catch (error) {
      setIsBookmarked(isBookmarked);
      toast.error("Failed to update bookmark", {
        description: "Please try again later"
      });
    }
  };

  const handleLike = async () => {
    try {
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

      const response = await axios.post(`${SERVER_URL}/post/${post._id}/like`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        toast.success(isLiked ? "Like removed" : "Post liked", {
          description: response.data.message
        });
      }
    } catch (error) {
      // Revert optimistic updates
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

      toast.error("Failed to update like", {
        description: "Please try again later"
      });
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await axios.delete(`${SERVER_URL}/post/${post._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setPosts(prevPosts => prevPosts.filter(p => p._id !== post._id));
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hover:shadow-xl hover:shadow-purple-500/20 hover:scale-[1.01] transition-all duration-300"
      >
        <Card className="bg-gray-900/95 border-purple-500/20 backdrop-blur relative hover:border-purple-500/40">

          <CardHeader className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12 rounded-full border-2 border-purple-500/20">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback>{`${post.author.firstName[0]}${post.author.lastName[0]}`}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex justify-between">
                  <h2 className="text-2xl font-bold text-white mb-2 leading-tight break-words">
                    {parseHashtags(post.title)}
                  </h2>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <div className="flex items-center">
                    <span className="flex items-center">
                      Posted by {post.author.fullName}
                      {post.author.verified && (
                        <BadgeCheck className="w-4 h-4 text-purple-500 ml-1" />
                      )}
                    </span>
                  </div>
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

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-2">
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
                        onClick={() => commentRedirect ? navigate(`/post/${post._id}`) : setShowCommentDialog(true)}
                      >
                        <MessageCircle className="h-5 w-5" />
                      </Button>

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
                    </div>

                    <div className="flex gap-1">
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

                      <Button variant="ghost"
                        size="sm"
                        className={`gap-2 hover:bg-white/10 text-white`}
                      >
                        <Flag className="h-4 w-4" />
                        <span>Report</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <CommentDialog
        open={showCommentDialog}
        onOpenChange={setShowCommentDialog}
        postId={post._id}
        onAddComment={handleAddComment}
      />
    </>
  );
};

export default Post;
