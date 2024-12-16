import { MessageSquare, ThumbsUp, AtSign, Reply, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from 'date-fns'

const getNotificationIcon = (type) => {
  switch (type) {
    case 'upvote':
      return <ThumbsUp className="h-5 w-5 text-accent" />
    case 'comment':
      return <MessageSquare className="h-5 w-5 text-primary" />
    case 'mention':
      return <AtSign className="h-5 w-5 text-green-500" />
    case 'reply':
      return <Reply className="h-5 w-5 text-blue-500" />
    default:
      return <MessageSquare className="h-5 w-5 text-primary" />
  }
}

export const NotificationItem = ({ notification, onRead }) => {
  const { _id, type, message, read, postId, createdAt } = notification

  return (
    <div
      className={`group mb-4 p-4 rounded-lg relative transition-all duration-200 
        ${read ? 'bg-card/50 text-black' : 'bg-accent/5'} hover:shadow-md`}
    >
      <div className="flex items-start gap-3">
        {!read && (
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-accent" />
        )}
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(type)}
        </div>
        <div className="flex-grow cursor-pointer" onClick={() => onRead(_id, postId)}>
          <p className={`text-base ${read ? 'text-muted-foreground' : 'text-foreground'}`}>
            {message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </p>
        </div>
        <Button variant="ghost" onClick={() => onRead(_id, postId)} className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
          <Check className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
