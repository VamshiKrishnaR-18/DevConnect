import React from "react";

export default function NotificationBar({ notifications }) {
  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      {notifications.slice(-5).map((note, i) => (
        <div
          key={i}
          className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-2 mb-2 rounded shadow"
        >
          {note}
        </div>
      ))}
    </div>
  );
}
