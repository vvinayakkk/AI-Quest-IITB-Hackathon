import { Bell, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NotificationItem } from "@/components/NotificationItem"
import { useNotifications } from "@/hooks/useNotifications"

const initialNotifications = [
  { 
    id: '1', 
    type: 'answer', 
    questionTitle: 'How to implement WebSocket in React?', 
    timestamp: '2024-03-17T10:30:00Z',
    hasRead: false 
  },
  { 
    id: '2', 
    type: 'upvote', 
    questionTitle: 'Best practices for state management in large React applications', 
    timestamp: '2024-03-17T08:30:00Z',
    hasRead: false 
  },
  { 
    id: '3', 
    type: 'answer', 
    questionTitle: 'Optimizing performance in Next.js applications', 
    timestamp: '2024-03-16T10:30:00Z',
    hasRead: false 
  },
  { 
    id: '4', 
    type: 'upvote', 
    questionTitle: 'How to implement WebSocket in React?', 
    timestamp: '2024-03-15T10:30:00Z',
    hasRead: false 
  }
]

export default function NotificationsPage() {
  const { notifications, markAllAsRead, markAsRead, deleteNotification, unreadCount } = useNotifications(initialNotifications)

  return (
    <Card className="w-full max-w-3xl my-6 mx-auto bg-background/80 border-purple-500/20 text-text">
      <CardHeader className="border-b border-border">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6 text-accent" />
              Notifications
            </CardTitle>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-accent text-white">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={markAllAsRead}
            className="text-accent hover:text-white/80"
          >
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        </div>
      </CardHeader>
      <ScrollArea className="h-[60vh]">
        <CardContent className="p-4">
          {notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))}
        </CardContent>
      </ScrollArea>
    </Card>
  )
}

