import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"
import axios from 'axios'
import { useUser } from "@/providers/UserProvider"
import Post from "@/components/post/Post"
import Reply from "@/components/post/Reply"
import ReplyInput from "@/components/post/ReplyInput"
import RelatedQuestions from "@/components/post/RelatedQuestions"

const SERVER_URL = import.meta.env.VITE_SERVER_URL

const PostDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${SERVER_URL}/post/${id}`)
      const data = response.data.data
      
      setPost(data)
      setComments(data?.comments || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch post')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddReply = async (content) => {
    const tempReply = {
      id: `temp-${Date.now()}`,
      content,
      author: 'CurrentUser',
      votes: 0,
      timestamp: new Date().toISOString(),
      type: 'user'
    }

    setComments(prev => [...prev, tempReply])

    try {
      const { data: newReply } = await axios.post(`${SERVER_URL}/posts/${id}/replies`, { content })
      setComments(prev => prev.map(reply =>
        reply.id === tempReply.id ? newReply : reply
      ))
    } catch (err) {
      setComments(prev => prev.filter(reply => reply.id !== tempReply.id))
      console.error('Error adding reply:', err.response?.data?.message)
    }
  }

  const handleVote = async (replyId, value) => {
    setComments(prev => prev.map(reply =>
      reply.id === replyId
        ? { ...reply, votes: reply.votes + value }
        : reply
    ))

    try {
      const { data: updatedReply } = await axios.post(`${SERVER_URL}/replies/${replyId}/vote`, { value })
      setComments(prev => prev.map(reply =>
        reply.id === replyId ? updatedReply : reply
      ))
    } catch (err) {
      setComments(prev => prev.map(reply =>
        reply.id === replyId
          ? { ...reply, votes: reply.votes - value }
          : reply
      ))
      console.error('Error voting:', err.response?.data?.message)
    }
  }

  const handleFlag = async (replyId) => {
    setComments(prev => prev.map(reply =>
      reply.id === replyId
        ? { ...reply, flagged: !reply.flagged }
        : reply
    ))

    try {
      const { data: updatedReply } = await axios.post(`${SERVER_URL}/replies/${replyId}/flag`)
      setComments(prev => prev.map(reply =>
        reply.id === replyId ? updatedReply : reply
      ))
    } catch (err) {
      setComments(prev => prev.map(reply =>
        reply.id === replyId
          ? { ...reply, flagged: !reply.flagged }
          : reply
      ))
      console.error('Error flagging reply:', err.response?.data?.message)
    }
  }

  const handleDeleteReply = async (replyId) => {
    const deletedReply = comments.find(reply => reply.id === replyId)
    setComments(prev => prev.filter(reply => reply.id !== replyId))

    try {
      await axios.delete(`${SERVER_URL}/replies/${replyId}`)
    } catch (err) {
      setComments(prev => [...prev, deletedReply])
      console.error('Error deleting reply:', err.response?.data?.message)
    }
  }

  const handleDeletePost = async () => {
    const deletedPost = post
    setIsLoading(true)
    setPost(null)

    try {
      await axios.delete(`${SERVER_URL}/posts/${id}`)
      navigate('/home')
    } catch (err) {
      setPost(deletedPost)
      setIsLoading(false)
      console.error('Error deleting post:', err.response?.data?.message)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
        <p className="text-gray-400 mt-4">Loading post...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => navigate('/posts')}
          className="mt-4 text-purple-400 hover:text-purple-300"
        >
          Return to Posts
        </button>
      </div>
    )
  }

  const sortedReplies = [...comments].sort((a, b) => {
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
          post={post}
          setPosts={null}
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
                onDelete={handleDeleteReply}
                isOwnReply={reply.author === 'CurrentUser'}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        <ReplyInput onSubmit={handleAddReply} />
        {post?.relatedQuestions && <RelatedQuestions relatedQuestions={post.relatedQuestions} />}
      </div>
    </motion.div>
  )
}

export default PostDetail