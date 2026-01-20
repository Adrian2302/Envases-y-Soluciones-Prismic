"use client";

import { useCart } from "../context/CartContext";

export default function Toast() {
  const { notifications } = useCart();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-[#2F5A3D] text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-toast-slide max-w-xs"
        >
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      ))}
    </div>
  );
}
