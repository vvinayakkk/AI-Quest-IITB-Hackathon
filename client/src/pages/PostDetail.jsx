import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import Post from "@/components/post/Post"
import Reply from "@/components/post/Reply"
import ReplyInput from "@/components/post/ReplyInput"
import RelatedQuestions from "@/components/post/RelatedQuestions"
import { getCurrentISOString } from "@/utils/dateUtils"
import { samplePost } from "@/assets/sampleData"

export default function PostDetail() {
  const [replies, setReplies] = useState(samplePost.replies)

  const handleAddReply = (content) => {
    const newReply = {
      id: replies.length + 1,
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
        <Post post={samplePost} />
        
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
              />
            </motion.div>
          ))}
        </AnimatePresence>

        <ReplyInput onSubmit={handleAddReply} />
        <RelatedQuestions />
      </div>
    </motion.div>
  )
}