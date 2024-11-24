
import { MessageSquare, ThumbsUp, Trash2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from 'date-fns'

export const NotificationItem = ({ notification, onRead, onDelete }) => {
  const { id, type, questionTitle, timestamp, hasRead } = notification
  
  return (
    <div
      className={`group mb-4 p-4 rounded-lg relative transition-all duration-200 
        ${hasRead ? 'bg-card/50 text-black' : 'bg-accent/5'} hover:shadow-md`}
    >
      <div className="flex items-start gap-3">
        {!hasRead && (
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-accent" />
        )}
        <div className="flex-shrink-0 mt-1">
          {type === 'answer' ? (
            <MessageSquare className="h-5 w-5 text-primary" />
          ) : (
            <ThumbsUp className="h-5 w-5 text-accent" />
          )}
        </div>
        <div className="flex-grow" onClick={() => onRead(id)}>
          <p className={`text-sm ${hasRead ? 'text-muted-foreground text-black' : 'text-foreground'}`}>
            {type === 'answer' ? 'New answer to your question:' : 'Your answer received an upvote:'}
          </p>
          <p className="text-base font-medium mt-1 line-clamp-2">{questionTitle}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
          </p>
        </div>
        <NotificationActions onDelete={() => onDelete(id)} />
      </div>
    </div>
  )
}

const NotificationActions = ({ onDelete }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
        <MoreVertical className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={onDelete}>
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)