import { useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

import { useAppDispatch, useAppSelector } from "@/store/redux/hooks";
import { fetchNotifications } from "@/store/redux/thunks/notificationsThunk";
import { useState } from "react";



export function NotificationBell() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  // Define a type for notificationsRaw to handle both array and paginated object
  type Notification = {
    id: string | number;
    title: string;
    message: string;
    created_at: string | number;
    // add other fields as needed
  };
  type NotificationsRaw = Notification[] | { data: Notification[] };

  const { data: notificationsRaw, loading, error } = useAppSelector(
    (state): { data: NotificationsRaw; loading: boolean; error: string | null } => state.notifications
  );
  // notificationsRaw can be either an array or an object with a 'data' array property (pagination structure)
  const notifications = Array.isArray(notificationsRaw)
    ? notificationsRaw
    : Array.isArray((notificationsRaw as { data?: Notification[] })?.data)
    ? (notificationsRaw as { data: Notification[] }).data
    : [];
  const [open, setOpen] = useState(false);

  // Only fetch notifications when dropdown is opened
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && user) {
      dispatch(fetchNotifications(1));
    }
  };

  // Unread count logic (if needed, e.g. all are unread)
  const unreadCount = notifications.length; // Adjust if you add read logic

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-primary/20 hover:text-primary transition-all duration-300 relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} new</Badge>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Loading...</div>
          ) : error ? (
            <div className="p-4 text-center text-destructive">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No notifications</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={
                  "p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                }
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-accent" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <div className="text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: notification.message }} />
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(Number(notification.created_at) * 1000), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationBell;
