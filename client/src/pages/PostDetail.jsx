import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react" // Import useEffect
import Post from "@/components/post/Post"
import Reply from "@/components/post/Reply"
import ReplyInput from "@/components/post/ReplyInput"
import RelatedQuestions from "@/components/post/RelatedQuestions"
import { getCurrentISOString } from "@/utils/dateUtils"
import { samplePosts } from "@/assets/sampleData" // Import samplePosts
import { Navigate, useParams } from "react-router-dom" // Import useParams
import { Loader2 } from "lucide-react" // Add this import

const PostDetail = () => {
  const { id } = useParams() // Get post id from URL
  const [post, setPost] = useState(null) // Initialize state
  const [replies, setReplies] = useState([])
  const [isDeleted, setIsDeleted] = useState(false)

  useEffect(() => {
    const foundPost = samplePosts.find(p => p.id === id)
    if (foundPost) {
      setPost(foundPost)
      setReplies(foundPost.replies)
      setIsDeleted(false)
    } else {
      setIsDeleted(true)
    }
  }, [id]) // Update when id changes

  // Hooks must be called unconditionally above this line

  if (isDeleted) {
    return <Navigate to="/404" /> // Redirect if post not found
  }

  if (!post) {
    return (
      <div className="text-center py-8">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
        <p className="text-gray-400 mt-4">Loading post...</p>
      </div>
    ) // Optional loading state
  }

  const handleAddReply = (content) => {
    const newReply = {
      id: `r${replies.length + 1}`,
      type: 'user',
      author: 'CurrentUser',
      content,
      votes: 0,
      timestamp: getCurrentISOString()
    }
    setReplies([...replies, newReply])
  }

  const handleVote = (replyId, value) => {
    setReplies(replies.map(reply =>
      reply.id === replyId
        ? { ...reply, votes: reply.votes + value }
        : reply
    ))
  }

  // Add flag handler
  const handleFlag = (replyId) => {
    setReplies(replies.map(reply =>
      reply.id === replyId
        ? { ...reply, flagged: !reply.flagged }
        : reply
    ))
  }

  // Add verify handler
  const handleVerify = (replyId) => {
    setReplies(replies.map(reply =>
      reply.id === replyId
        ? { ...reply, verified: !reply.verified }
        : reply
    ))
  }

  const handleDeleteReply = (replyId) => {
    setReplies(replies.filter(reply => reply.id !== replyId))
  }

  const handleDeletePost = () => {
    setIsDeleted(true)
    // Here you would typically make an API call to delete the post
    // and then redirect to the posts list
  }

  const sortedReplies = [...replies].sort((a, b) => {
    // Department verified answers have highest priority
    if (a.verified && !b.verified) return -1;
    if (!a.verified && b.verified) return 1;

    // AI answers come next
    if (a.type === 'ai' && b.type !== 'ai') return -1;
    if (a.type !== 'ai' && b.type === 'ai') return 1;

    // Then sort by votes
    return b.votes - a.votes;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto py-8 px-4 min-h-screen"
    >
      <div className="space-y-6">
        <Post
          post={post} // Use post from samplePosts
          onDelete={handleDeletePost}
          isOwnPost={post.author.id === 'currentUserId'} // Check ownership
        />

        <AnimatePresence mode="popLayout">
          {sortedReplies.map((reply, index) => (
            <motion.div
              key={reply.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
            >
              <Reply
                reply={reply}
                onVote={handleVote}
                onFlag={handleFlag}
                onVerify={handleVerify}
                onDelete={handleDeleteReply}
                isOwnReply={reply.author === 'CurrentUser'} // Replace with actual user check
              />
            </motion.div>
          ))}
        </AnimatePresence>

        <ReplyInput onSubmit={handleAddReply} />
        <RelatedQuestions relatedQuestions={post.relatedQuestions} /> {/* Pass related questions */}
      </div>
    </motion.div>
  )
}

export default PostDetail;