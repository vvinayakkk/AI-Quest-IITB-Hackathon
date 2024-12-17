import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Share2, Flag, AlertCircle, BadgeCheck, ArrowUp, ArrowDown, Star, Trash2 } from 'lucide-react'
import { formatTimeAgo, formatUTCTimestamp } from "@/utils/dateUtils"

const Reply = ({ reply, onVote, onFlag, onDelete, isOwnReply }) => {
  const [liked, setLiked] = useState(false)
  const [voteStatus, setVoteStatus] = useState(null)

  const handleLike = () => {
    setLiked(!liked)
    onVote(reply.id, !liked ? 1 : -1)
  }

  const handleVote = (id, value) => {
    if (voteStatus === 'up' && value === 1) {
      setVoteStatus(null)
      onVote(id, -1)
    } else if (voteStatus === 'down' && value === -1) {
      setVoteStatus(null)
      onVote(id, 1)
    } else {
      setVoteStatus(value === 1 ? 'up' : 'down')
      onVote(id, value)
    }
  }

  const getBadgeColor = () => {
    switch (reply.type) {
      case 'ai': return 'text-blue-400 border-blue-500'
      case 'department': return 'text-green-400 border-green-500'
      default: return 'text-purple-400 border-purple-500'
    }
  }

  const getReplyLabel = () => {
    if (reply.verified && reply.type === 'department') {
      return (
        <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
          <BadgeCheck className="h-3 w-3" />
          Correct Answer
        </span>
      );
    }
    if (reply.type === 'ai') {
      return (
        <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
          <Star className="h-3 w-3 fill-blue-400" />
          AI Response
        </span>
      );
    }
    if (reply.department) {
      return (
        <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-xs">
          {reply.department} Department
        </span>
      );
    }
    return null;
  }

  return (
    <Card className={`${reply.verified && reply.type === 'department'
        ? 'bg-green-900/20 border-green-500/20 hover:shadow-green-500/10'
        : reply.type === 'ai'
          ? 'bg-blue-900/30 border-blue-500/20 hover:shadow-blue-500/10'
          : 'bg-gray-900/95 border-purple-500/20 hover:shadow-purple-500/10'
      } backdrop-blur relative hover:shadow-lg transition-all duration-300`}>
      {reply.flagged && (
        <div className="absolute top-0 right-0 m-2">
          <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Flagged
          </span>
        </div>
      )}

      <div className="flex gap-4 p-6">
        <div className="flex flex-col items-center gap-1 min-w-[40px]">
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full hover:bg-white/10 transition-colors ${voteStatus === 'up' ? 'text-green-400' : 'text-gray-400'
              }`}
            onClick={() => handleVote(reply.id, 1)}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
          <span className="text-lg font-bold text-white">{reply.votes}</span>
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full hover:bg-white/10 transition-colors ${voteStatus === 'down' ? 'text-red-400' : 'text-gray-400'
              }`}
            onClick={() => handleVote(reply.id, -1)}
          >
            <ArrowDown className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className={`h-10 w-10 rounded-xl border-2 ${getBadgeColor()}`}>
              <AvatarImage src={reply.avatar || "/placeholder.svg"} />
              <AvatarFallback>{reply.initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <div>
                <span className="text-text font-semibold">{reply.username}</span>
                {getReplyLabel()}
              </div>
              <span
                className="text-sm text-gray-400"
                title={formatUTCTimestamp(reply.timestamp)}
              >
                {formatTimeAgo(reply.timestamp)}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-200 leading-relaxed">{reply.content}</p>
          </div>

          <div className="flex gap-4 text-gray-400">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hover:bg-white/10 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${reply.flagged ? 'text-red-400' : ''} hover:bg-white/10 transition-colors`}
              onClick={() => onFlag(reply.id)}
            >
              <Flag className="h-4 w-4" />
              <span>Flag</span>
            </Button>
            {isOwnReply && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-red-400 hover:bg-red-500/10 transition-colors"
                onClick={() => onDelete(reply.id)}
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default Reply