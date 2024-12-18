import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle } from "lucide-react"

const CommentDialog = ({
  open,
  onOpenChange,
  onAddComment = null,
  onAddReply = null,
  commentId = null,
  mode = 'comment'
}) => {
  const [text, setText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return

    setIsSubmitting(true)
    if (mode === 'comment') await onAddComment(text)
    else await onAddReply(commentId, text)
    setText("")
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const titles = {
    comment: 'Add Your Comment',
    reply: 'Add Your Reply'
  }

  const placeholders = {
    comment: 'Write your comment...',
    reply: 'Write your reply...'
  }

  const buttonText = {
    comment: isSubmitting ? "Posting..." : "Post Comment",
    reply: isSubmitting ? "Replying..." : "Post Reply"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-gray-900/95 border-purple-500/20 backdrop-blur p-6">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            <MessageCircle className="h-6 w-6 text-purple-400" />
            {titles[mode]}
          </DialogTitle>
          <p className="text-sm text-gray-400">
            Share your thoughts, ask questions, or provide insights
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <Textarea
            placeholder={placeholders[mode]}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[120px] bg-black/40 border-gray-800 focus:border-purple-500 text-white placeholder:text-gray-500 resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !text.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {buttonText[mode]}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { CommentDialog }