import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"
import axios from 'axios'
import { useUser } from "@/providers/UserProvider"
import Post from "@/components/post/Post"
import CommentCard from "@/components/post/CommentCard"
import RelatedQuestions from "@/components/post/RelatedQuestions"

const SERVER_URL = import.meta.env.VITE_SERVER_URL

const replies = [
  {
    _id: "r8",
    author: {
      _id: "ai123",
      firstName: "AI",
      lastName: "Assistant",
      fullName: "AI Assistant",
      avatar: "/avatars/ai-assistant.jpg",
      verified: true,
      department: "AI"
    },
    content: "A smart contract is a program that runs on the Ethereum blockchain that facilitates the exchange of assets.",
    type: "ai",
    upvotes: [],
    replies: [
      {
        _id: "r11",
        author: {
          _id: "block123",
          firstName: "Blockchain",
          lastName: "Fan",
          fullName: "Blockchain Fan",
          avatar: "/avatars/blockchainfan.jpg",
          verified: false
        },
        content: "Yes, it also includes support for new scripting capabilities.",
        type: "user",
        upvotes: [],
        replies: [
          {
            _id: "r12",
            author: {
              _id: "block123",
              firstName: "Blockchain",
              lastName: "Fan",
              fullName: "Blockchain Fan",
              avatar: "/avatars/blockchainfan.jpg",
              verified: false
            },
            content: "Yes, it also includes support for new scripting capabilities.",
            type: "user",
            upvotes: [],
            replies: [],
            flagged: { status: true, reason: "", by: null },
            createdAt: "2024-03-24T12:05:00Z"
          },
        ],
        flagged: { status: true, reason: "", by: null },
        createdAt: "2024-03-24T12:05:00Z"
      },
    ],
    flagged: { status: false, reason: "", by: null },
    createdAt: "2024-03-23T10:20:00Z"
  },
  {
    _id: "r9",
    author: {
      _id: "tech123",
      firstName: "Tech",
      lastName: "Insights",
      fullName: "Tech Insights",
      avatar: "/avatars/techinsights.jpg",
      verified: true,
      department: "Technology"
    },
    content: "The update introduces improved transaction speeds and enhanced security features.",
    type: "correct",
    upvotes: [],
    replies: [],
    flagged: { status: false, reason: "", by: null },
    createdAt: "2024-03-24T12:00:00Z"
  },
  {
    _id: "r10",
    author: {
      _id: "block123",
      firstName: "Blockchain",
      lastName: "Fan",
      fullName: "Blockchain Fan",
      avatar: "/avatars/blockchainfan.jpg",
      verified: false
    },
    content: "Yes, it also includes support for new scripting capabilities.",
    type: "user",
    upvotes: [],
    replies: [],
    flagged: { status: true, reason: "", by: null },
    createdAt: "2024-03-24T12:05:00Z"
  }
]

const PostDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useUser()
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
      const response = await axios.get(`${SERVER_URL}/post/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = response.data.data

      setPost(data)
      setComments(data?.comments || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch post')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddComment = async (content) => {
    const tempComment = {
      _id: `temp-${Date.now()}`,
      content,
      author: user,
      type: 'user',
      upvotes: [],
      replies: [],
      createdAt: new Date().toISOString(),
    }

    setComments(prev => [...prev, tempComment])

    try {
      const response = await axios.post(
        `${SERVER_URL}/post/${id}/comment`,
        { content },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      setComments(prev => prev.map(comment =>
        comment._id === tempComment._id ? response.data.data : comment
      ))
    } catch (err) {
      setComments(prev => prev.filter(comment => comment._id !== tempComment._id))
      console.error('Error adding comment:', err.response?.data?.message)
    }
  }

  const updateCommentReplies = (comments, commentId, newReply) => {
    return comments.map(comment => {
      if (comment._id === commentId) {
        return {
          ...comment,
          replies: [...comment.replies, newReply]
        };
      }
      if (comment.replies?.length > 0) {
        return {
          ...comment,
          replies: updateCommentReplies(comment.replies, commentId, newReply)
        };
      }
      return comment;
    });
  };

  const handleAddReply = async (commentId, content) => {
    // const tempReply = {
    //   _id: `temp-${Date.now()}`,
    //   content,
    //   author: user,
    //   type: 'user',
    //   upvotes: [],
    //   replies: [],
    //   createdAt: new Date().toISOString(),
    // };

    // setComments(prev => updateCommentReplies(prev, commentId, tempReply));

    try {
      const response = await axios.post(
        `${SERVER_URL}/post/comment/${commentId}/reply`,
        { content },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Update the temporary reply with the real one
      setComments(prev => updateCommentReplies(
        prev, 
        commentId, 
        response.data.data
      ));
    } catch (err) {
      // Remove the temporary reply if there's an error
      setComments(prev => prev.map(comment => {
        if (comment._id === commentId) {
          return {
            ...comment,
            replies: comment.replies.filter(reply => reply._id !== tempReply._id)
          };
        }
        return comment;
      }));
      console.error('Error adding reply:', err.response?.data?.message);
    }
  };

const updateReplyVotes = (comments, commentId, replyId, value) => {
  return comments.map(comment => {
    if (comment._id === commentId) {
      return {
        ...comment,
        replies: comment.replies.map(reply =>
          reply._id === replyId
            ? { ...reply, upvotes: [...reply.upvotes, value] }
            : reply
        )
      };
    }
    return comment;
  });
};

const removeReply = (comments, commentId, replyId) => {
  return comments.map(comment => {
    if (comment._id === commentId) {
      return {
        ...comment,
        replies: comment.replies.filter(reply => reply._id !== replyId)
      };
    }
    return comment;
  });
};

const handleVoteReply = async (commentId, replyId, value) => {
  setComments(prev => updateReplyVotes(prev, commentId, replyId, value));

  try {
    await axios.post(
      `${SERVER_URL}/post/comment/${replyId}/upvote`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
  } catch (err) {
    // Revert the optimistic update
    setComments(prev => updateReplyVotes(prev, commentId, replyId, -value));
    console.error('Error voting reply:', err.response?.data?.message);
  }
};

const handleDeleteReply = async (commentId, replyId) => {
  // Store the current state for potential rollback
  const previousComments = comments;
  
  // Optimistic update - remove the reply
  setComments(prev => removeReply(prev, commentId, replyId));

  try {
    await axios.delete(
      `${SERVER_URL}/post/comment/${commentId}/reply/${replyId}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
  } catch (err) {
    // Restore the previous state if deletion fails
    setComments(previousComments);
    console.error('Error deleting reply:', err.response?.data?.message);
  }
};

  const handleVoteComment = async (commentId, value) => {
    setComments(prev => prev.map(comment =>
      comment._id === commentId
        ? { ...comment, upvotes: comment.upvotes + value }
        : comment
    ))

    try {
      await axios.post(`${SERVER_URL}/post/comment/${commentId}/upvote`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
    } catch (err) {
      setComments(prev => prev.map(comment =>
        comment._id === commentId
          ? { ...comment, upvotes: comment.upvotes - value }
          : comment
      ))
      console.error('Error voting:', err.response?.data?.message)
    }
  }

  const handleFlagComment = async (commentId) => {
    setComments(prev => prev.map(comment =>
      comment._id === commentId
        ? { ...comment, flagged: { ...comment.flagged, status: !comment.flagged.status } }
        : comment
    ))

    try {
      // const { data: updatedComment } = await axios.post(`${SERVER_URL}/replies/${commentId}/flag`, {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // })
      // setComments(prev => prev.map(comment =>
      //   comment.id === commentId ? updatedComment : comment
      // ))
    } catch (err) {
      setComments(prev => prev.map(comment =>
        comment.id === commentId
          ? { ...comment, flagged: !comment.flagged }
          : comment
      ))
      console.error('Error flagging comment:', err.response?.data?.message)
    }
  }

  const handleDeleteComment = async (commentId) => {
    const deletedComment = comments.find(comment => comment._id === commentId)
    setComments(prev => prev.filter(comment => comment._id !== commentId))

    try {
      await axios.delete(`${SERVER_URL}/post/comment/${commentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
    } catch (err) {
      setComments(prev => [...prev, deletedComment])
      console.error('Error deleting comment:', err.response?.data?.message)
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

  const sortedComments = comments.sort((a, b) => {
  // const sortedComments = replies.sort((a, b) => {
    // Correct answers have highest priority
    if (a.type === 'correct' && b.type !== 'correct') return -1;
    if (a.type !== 'correct' && b.type === 'correct') return 1;

    // AI answers come next
    if (a.type === 'ai' && b.type !== 'ai') return -1;
    if (a.type !== 'ai' && b.type === 'ai') return 1;

    // User answers come last
    if (a.type === 'user' && b.type !== 'user') return -1;
    if (a.type !== 'user' && b.type === 'user') return 1;

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
          handleAddComment={handleAddComment}
          commentRedirect={false}
        />

        <AnimatePresence mode="popLayout">
          {sortedComments.map((comment, index) => (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
            >
              <CommentCard
                comment={comment}
                postId={post._id}
                onVote={handleVoteComment}
                onFlag={handleFlagComment}
                onDelete={handleDeleteComment}
                onReplyAdd={handleAddReply}
                onReplyVote={handleVoteReply}
                onReplyDelete={handleDeleteReply}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {post?.relatedQuestions && <RelatedQuestions relatedQuestions={post.relatedQuestions} />}
      </div>
    </motion.div>
  )
}

export default PostDetail