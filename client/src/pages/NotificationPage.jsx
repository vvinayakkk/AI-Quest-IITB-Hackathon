import { Bell, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NotificationItem } from "@/components/NotificationItem"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { useEffect, useState } from "react"

const markAllAsRead = (setNotifications) => {
  setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  toast.success("All notifications marked as read")
}

const markAsRead = (_id, setNotifications) => {
  setNotifications(prev => prev.map(n =>
    n._id === _id ? { ...n, read: true } : n
  ))
}

const getUnreadCount = (notifications) => notifications.filter(n => !n.read).length

export default function NotificationsPage() {
  const { user, isLoading } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!isLoading && user?.notifications) {
      setNotifications(user.notifications);
    }
  }, [user, isLoading]);

  return (
    <Card className="w-full max-w-3xl my-6 mx-auto bg-background/80 border-purple-500/20 text-text">
      <CardHeader className="border-b border-border">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6 text-accent" />
              Notifications
            </CardTitle>
            {getUnreadCount(notifications) > 0 && (
              <Badge variant="secondary" className="bg-accent text-white">
                {getUnreadCount(notifications)} new
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllAsRead(setNotifications)}
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
              key={notification._id}
              notification={notification}
              onRead={(id) => markAsRead(id, setNotifications)}
            />
          ))}
        </CardContent>
      </ScrollArea>
    </Card>
  )
}

