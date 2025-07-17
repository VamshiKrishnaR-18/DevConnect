import { createContext, useEffect, useContext, useState } from "react";
import { io } from "socket.io-client";

const socketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Initialize socket connection
        const socketInstance = io("https://devconnect-f4au.onrender.com", {
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            timeout: 20000,
        });

        // Connection event handlers
        socketInstance.on("connect", () => {
            console.log("Socket connected:", socketInstance.id);
        });

        socketInstance.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
        });

        socketInstance.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });

        // Set the socket in state so components can access it
        setSocket(socketInstance);

        // Cleanup on unmount
        return () => {
            if (socketInstance) {
                socketInstance.disconnect();
            }
        };
    }, []);

    return (
        <socketContext.Provider value={socket}>
            {children}
        </socketContext.Provider>
    );
};

export const useSocket = () => {
    const socket = useContext(socketContext);
    if (socket === undefined) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return socket; // This can be null initially, which is fine
};
