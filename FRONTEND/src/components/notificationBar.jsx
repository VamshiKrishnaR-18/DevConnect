import React from "react";

export default function NotificationBar({ notifications }) {
  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      {notifications.slice(-5).map((note, i) => (
        <div
          key={i}
          className="bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-500 text-blue-800 dark:text-blue-400 px-4 py-2 mb-2 rounded shadow transition-colors"
        >
          {note}
        </div>
      ))}
    </div>
  );
}
