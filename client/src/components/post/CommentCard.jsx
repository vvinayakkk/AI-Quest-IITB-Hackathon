import { useState, useEffect } from "react"
import ReactMarkdown from 'react-markdown'
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Flag, BadgeCheck, Star, Trash2, MessageCircle, Check, ArrowBigUp, ArrowBigDown } from 'lucide-react'
import { formatTimeAgo, formatUTCTimestamp } from "@/utils/dateUtils"
import { useUser } from "@/providers/UserProvider"
import { parseHashtags } from "@/utils/hashtagUtils"
import { CommentDialog } from "./CommentDialog"

const CommentCard = ({ comment, postId, onVote, onFlag, onDelete, onMarkCorrect, isReply = false, parentCommentId = null, onReplyAdd, onReplyVote, onReplyDelete }) => {
  const { user } = useUser()
  const [flagged] = useState(comment.flagged?.status)
  const [upvotes, setUpvotes] = useState(comment.upvotes?.length || 0)
  const [liked, setLiked] = useState(comment.upvotes?.includes(user._id))
  const [isCorrect, setIsCorrect] = useState(comment.type === 'correct')
  const [showCommentDialog, setShowCommentDialog] = useState(false)

  useEffect(() => {
    setIsCorrect(comment.type === 'correct')
  }, [comment.type])

  const getBadgeColor = () => {
    switch (comment.type) {
      case 'correct': return 'text-green-400 border-green-500'
      case 'ai': return 'text-blue-400 border-blue-500'
      default: return 'text-purple-400 border-purple-500'
    }
  }

  const getReplyLabel = () => {
    if (comment.type === 'correct') {
      return (
        <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full text-[10px] flex items-center gap-0.5">
          <BadgeCheck className="h-3 w-3" />
          Correct Answer
        </span>
      );
    }
    if (comment.type === 'ai') {
      return (
        <span className="bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full text-[10px] flex items-center gap-0.5">
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
    setUpvotes(prev => prev + voteValue)
    if (isReply) onVote(commentId, voteValue)
    else onReplyVote(parentCommentId, commentId, voteValue)
  }

  const handleMarkCorrect = async () => {
    try {
      await onMarkCorrect(comment._id)
      setIsCorrect(!isCorrect)
    } catch (error) {
      console.error('Error marking comment as correct:', error)
    }
  }

  return (
    <>
      <div className={`${isReply ? 'ml-6' : ''} relative`}>
        {isReply && (
          <div className="absolute left-0 top-0 bottom-0">
            <div className="absolute left-2 top-0 bottom-0 w-[2px] bg-gray-700/50" />
          </div>
        )}

        <Card className={`${comment.type === 'correct'
          ? 'bg-green-900/20 border-green-500/20 hover:shadow-green-500/10'
          : comment.type === 'ai'
            ? 'bg-blue-900/30 border-blue-500/20 hover:shadow-blue-500/10'
            : 'bg-gray-900/95 border-purple-500/20 hover:shadow-purple-500/10'
          } backdrop-blur relative hover:shadow-lg transition-all duration-300`}>
          <div className="p-3">
            <div className="flex-1">
              <div className="flex justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Avatar className={`h-9 w-9 rounded-full ${getBadgeColor()}`}>
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
                    {comment.author?.department && <span className="text-[11px] text-gray-400">{comment.author?.department}</span>}
                    <span
                      className="text-[11px] text-gray-400"
                      title={formatUTCTimestamp(comment.createdAt)}
                    >
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                </div>

                {(!isReply && ["Admin", "Moderator"].includes(user.role)) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-2 ${isCorrect
                      ? "text-green-400 hover:text-red-400 hover:bg-red-500/10"
                      : "text-gray-400 hover:text-green-400 hover:bg-green-500/10"
                      } transition-all duration-200`}
                    onClick={handleMarkCorrect}
                  >
                    {isCorrect ? 'Mark as not Correct' : 'Mark as Correct'}
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="mb-2 pl-10">
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{comment.content}</ReactMarkdown>
                </div>
              </div>

              <div className="flex justify-between text-gray-400 pl-10">
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`transition-all hover:bg-white/10 text-white'}`}
                    onClick={() => handleVote(comment._id)}
                  >
                    {liked ? (
                      <ArrowBigDown className="h-5 w-5 fill-current" />
                    ) : (
                      <ArrowBigUp className="h-5 w-5 fill-current" />
                    )}
                    <span className="ml-1 text-sm">{upvotes}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="transition-all hover:bg-white/10 text-white"
                    onClick={() => setShowCommentDialog(true)}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-1">
                  {((comment.author._id === user._id) || (["Admin", "Moderator"].includes(user.role))) && <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-red-400 hover:bg-red-500/10 transition-colors"
                    onClick={() => !isReply ? onDelete(comment._id) : onReplyDelete(parentCommentId, comment._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>}

                  {/* <Button
                variant="ghost"
                size="sm"
                className={`gap-2 ${flagged ? 'text-red-400' : ''}`}
                onClick={() => onFlag(comment._id)}
              >
                <Flag className="h-4 w-4" />
                <span>Flag</span>
              </Button> */}
                </div>
              </div>
            </div>
          </div>

          {comment.replies && comment.replies.length > 0 && (
            <div className="relative">
              {comment.replies.map((reply, index) => (
                <div key={reply._id} className={index > 0 ? 'mt-3' : ''}>
                  <CommentCard
                    comment={reply}
                    postId={postId}
                    onVote={onVote}
                    onFlag={onFlag}
                    onDelete={onDelete}
                    onMarkCorrect={onMarkCorrect}
                    isReply={true}
                    parentCommentId={comment._id}
                    onReplyAdd={onReplyAdd}
                    onReplyVote={onReplyVote}
                    onReplyDelete={onReplyDelete}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <CommentDialog
        open={showCommentDialog}
        onOpenChange={setShowCommentDialog}
        onAddComment={null}
        commentId={comment._id}
        onAddReply={onReplyAdd}
        mode="reply"
      />
    </>
  )
}

export default CommentCard