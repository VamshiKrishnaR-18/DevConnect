import { createContext, useContext } from "react";

// 1. Create the Context
export const NotificationContext = createContext(null);

// 2. Create a Custom Hook for easy access
export const useNotification = () => {
  return useContext(NotificationContext);
};