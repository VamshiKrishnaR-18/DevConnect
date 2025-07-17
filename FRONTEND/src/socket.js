import {io} from "socket.io-client";
const socket = io("https://devconnect-f4au.onrender.com", {
  withCredentials: true,
  transports: ["websocket", "polling"]
});

export default socket;
