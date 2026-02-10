import React from "react";
import { INotification, NotificationType } from "../models/types";
import { useT } from "../i18n/I18nContext";
import { formatTimeAgo } from "./Header";

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
  const { t } = useT();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <div className="notification-overlay" onClick={onClose} />
      <div className="notification-panel">
        <div className="notification-header">
          <h3>
            {t("notifications.title")}{" "}
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
                {t("notifications.markAllRead")}
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
              <div>{t("notifications.empty")}</div>
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
                  <div className="notification-time">{formatTimeAgo(notification.timestamp, t)}</div>
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

export default NotificationPanel;
