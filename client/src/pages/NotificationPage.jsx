import { Bell, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NotificationItem } from "@/components/NotificationItem"
import { toast } from "sonner"
import { useUser } from "@/providers/UserProvider"
import axios from "axios"

const SERVER_URL = import.meta.env.VITE_SERVER_URL

const markAllAsRead = async (notifications, setNotifications) => {
  try {
    // Optimistically update UI
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    // Process all unread notifications
    const unreadNotifications = notifications.filter(n => !n.read);
    await Promise.all(
      unreadNotifications.map(notification =>
        markAsRead(notification._id, setNotifications)
      )
    );

    toast.success("All notifications marked as read");
  } catch (error) {
    // Revert changes on error
    setNotifications(prev => notifications);
    toast.error("Failed to mark all notifications as read");
  }
}

const markAsRead = async (_id, setNotifications) => {
  try {
    // Optimistically update UI
    setNotifications(prev => prev.map(n =>
      n._id === _id ? { ...n, read: true } : n
    ));

    const response = await axios.patch(
      `${SERVER_URL}/user/notification/${_id}/read`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (!response.data.success) {
      // Revert changes if request failed
      setNotifications(prev => prev.map(n =>
        n._id === _id ? { ...n, read: false } : n
      ));
    }
  } catch (error) {
    // Revert changes and show error
    setNotifications(prev => prev.map(n =>
      n._id === _id ? { ...n, read: false } : n
    ));
  }
}

const getUnreadCount = (notifications) => notifications.filter(n => !n.read).length

const NotificationsPage = () => {
  const { notifications, setNotifications } = useUser();

  const sortedNotifications = [...notifications].sort((a, b) => {
    if (!a.read && b.read) return -1;
    if (a.read && !b.read) return 1;

    return new Date(b.createdAt) - new Date(a.createdAt);
  });

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
            onClick={() => markAllAsRead(notifications, setNotifications)}
            className="text-accent hover:text-white/80"
          >
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        </div>
      </CardHeader>
      <ScrollArea className="h-[60vh]">
        <CardContent className="p-4">
          {sortedNotifications.map(notification => (
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


export default NotificationsPage