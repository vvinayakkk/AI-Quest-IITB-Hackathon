import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Flag, BadgeCheck, Star, Trash2, ThumbsUp, MessageCircle } from 'lucide-react'
import { formatTimeAgo, formatUTCTimestamp } from "@/utils/dateUtils"
import { useUser } from "@/providers/UserProvider"
import { useNavigate } from "react-router-dom"

const CommentCard = ({ comment, postId, onVote, onFlag, onDelete }) => {
  const navigate = useNavigate()
  const { user } = useUser()
  const [flagged] = useState(comment.flagged.status)
  const [upvotes] = useState(comment.upvotes?.length || 0)
  const [liked, setLiked] = useState(comment.upvotes?.includes(user._id))

  const getBadgeColor = () => {
    switch (comment.type) {
      case 'ai': return 'text-blue-400 border-blue-500'
      case 'correct': return 'text-green-400 border-green-500'
      default: return 'text-purple-400 border-purple-500'
    }
  }

  const getReplyLabel = () => {
    if (comment.type === 'correct') {
      return (
        <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
          <BadgeCheck className="h-3 w-3" />
          Correct Answer
        </span>
      );
    }
    if (comment.type === 'ai') {
      return (
        <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
          <Star className="h-3 w-3 fill-blue-400" />
          AI Response
        </span>
      );
    }
    return null;
  }

  const handleVote = (commentId) => {
    const voteValue = liked ? -1 : 1
    setLiked(!liked)
    onVote(commentId, voteValue)
  }

  return (
    <Card className={`${comment.type === 'correct'
      ? 'bg-green-900/20 border-green-500/20 hover:shadow-green-500/10'
      : comment.type === 'ai'
        ? 'bg-blue-900/30 border-blue-500/20 hover:shadow-blue-500/10'
        : 'bg-gray-900/95 border-purple-500/20 hover:shadow-purple-500/10'
      } backdrop-blur relative hover:shadow-lg transition-all duration-300`}>

      <div className="flex gap-4 p-6">
        <div className="flex-1">
          <div className="flex justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className={`h-12 w-12 rounded-full border-2 ${getBadgeColor()}`}>
                <AvatarImage src={comment.author.avatar} />
                <AvatarFallback>{`${comment.author.firstName[0]}${comment.author.lastName[0]}`}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <span className="text-text font-semibold">{comment.author.fullName}</span>
                    {comment.author.verified && (
                      <BadgeCheck className="w-4 h-4 text-purple-500 ml-1" />
                    )}
                  </div>
                  {getReplyLabel()}
                </div>
                {comment.author?.department && <span className="text-sm text-gray-400">{comment.author?.department}</span>}
                <span
                  className="text-sm text-gray-400"
                  title={formatUTCTimestamp(comment.createdAt)}
                >
                  {formatTimeAgo(comment.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-200 leading-relaxed">{comment.content}</p>
          </div>

          <div className="flex justify-between text-gray-400">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={"transition-all hover:bg-white/10 text-white"}
                onClick={() => handleVote(comment._id)}
              >
                <ThumbsUp className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                <span>{upvotes}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="transition-all hover:bg-white/10 text-white"
                onClick={() => navigate(`/post/${postId}`)}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex gap-1">
            {((comment.author._id === user._id) || (["Admin", "Moderator"].includes(user.role))) && <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-red-400 hover:bg-red-500/10 transition-colors"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>}

            {/* <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${flagged ? 'text-red-400' : ''} hover:bg-white/10 transition-colors`}
              onClick={() => onFlag(comment._id)}
            >
              <Flag className="h-4 w-4" />
              <span>Flag</span>
            </Button> */}
          </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default CommentCard