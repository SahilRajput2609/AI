import { useState } from "react";
import {
  CheckCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

type NotificationType = "success" | "warning" | "info";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
}

const notificationsData: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Task Completed",
    message: "Coder finished writing auth middleware.",
    time: "2 min ago",
  },
  {
    id: "2",
    type: "warning",
    title: "High Memory Usage",
    message: "Memory usage reached 82%.",
    time: "5 min ago",
  },
  {
    id: "3",
    type: "info",
    title: "Plan Updated",
    message: "Planner generated 3 new subtasks.",
    time: "8 min ago",
  },
];

export function NotificationToast() {
  const [notifications, setNotifications] =
    useState(notificationsData);

  function removeNotification(id: string) {
    setNotifications((prev) =>
      prev.filter((item) => item.id !== id)
    );
  }

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return (
          <CheckCircle
            className="text-green-500"
            size={20}
          />
        );

      case "warning":
        return (
          <AlertTriangle
            className="text-yellow-500"
            size={20}
          />
        );

      case "info":
      default:
        return (
          <Info
            className="text-blue-500"
            size={20}
          />
        );
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="w-80 rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl p-4"
        >
          <div className="flex items-start gap-3">
            {getIcon(notification.type)}

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">
                  {notification.title}
                </h3>

                <button
                  onClick={() =>
                    removeNotification(notification.id)
                  }
                  className="text-zinc-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-zinc-300 text-sm mt-1">
                {notification.message}
              </p>

              <p className="text-zinc-500 text-xs mt-2">
                {notification.time}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}