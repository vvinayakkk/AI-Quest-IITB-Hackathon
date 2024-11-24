
import { useState } from "react"
import { toast } from "sonner"

export const useNotifications = (initialData) => {
  const [notifications, setNotifications] = useState(initialData)

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, hasRead: true })))
    toast.success("All notifications marked as read")
  }

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, hasRead: true } : n
    ))
  }

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    toast.error("Notification deleted")
  }

  const getUnreadCount = () => notifications.filter(n => !n.hasRead).length

  return {
    notifications,
    markAllAsRead,
    markAsRead,
    deleteNotification,
    unreadCount: getUnreadCount()
  }
}