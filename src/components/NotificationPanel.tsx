import React from "react";
import { INotification, NotificationType } from "../models/types";

interface NotificationPanelProps {
  notifications: INotification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
}) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <div className="notification-overlay" onClick={onClose} />
      <div className="notification-panel">
        <div className="notification-header">
          <h3>
            Notifications{" "}
            {unreadCount > 0 && (
              <span
                style={{
                  fontSize: "12px",
                  background: "#d13438",
                  color: "white",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  marginLeft: "8px",
                }}
              >
                {unreadCount}
              </span>
            )}
          </h3>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {unreadCount > 0 && (
              <button
                className="btn"
                onClick={onMarkAllRead}
                style={{ fontSize: "11px", padding: "4px 10px" }}
              >
                Mark all read
              </button>
            )}
            <button className="close-btn" onClick={onClose}>
              &#10005;
            </button>
          </div>
        </div>

        <div className="notification-body">
          {notifications.length === 0 ? (
            <div className="notification-empty">
              <div className="empty-icon">&#128276;</div>
              <div>No notifications yet</div>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.isRead ? "unread" : ""}`}
                onClick={() => {
                  onMarkRead(notification.id);
                  if (notification.pullRequest?.url) {
                    window.open(notification.pullRequest.url, "_blank", "noopener,noreferrer");
                  }
                }}
              >
                <div className={`notification-icon ${getNotificationIconClass(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">{formatTimeAgo(notification.timestamp)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case NotificationType.MergeConflict: return "\u26A0";
    case NotificationType.Approved: return "\u2713";
    case NotificationType.Rejected: return "\u2717";
    case NotificationType.CommentAdded: return "\uD83D\uDCAC";
    case NotificationType.StatusChanged: return "\u25CF";
    default: return "\u25CF";
  }
}

function getNotificationIconClass(type: NotificationType): string {
  switch (type) {
    case NotificationType.MergeConflict: return "conflict";
    case NotificationType.Approved: return "approved";
    case NotificationType.Rejected: return "rejected";
    case NotificationType.CommentAdded: return "comment";
    default: return "comment";
  }
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default NotificationPanel;
