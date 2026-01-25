import { createContext, useContext } from "react";

// 1. Create the Context
export const SocketContext = createContext(null);

// 2. Create the Custom Hook
// This allows other components to just import { useSocket } without needing useContext() every time.
export const useSocket = () => {
  return useContext(SocketContext);
};