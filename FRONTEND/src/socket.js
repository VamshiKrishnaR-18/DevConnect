import { io } from "socket.io-client";
import config, { getSocketUrl } from "./config/environment.js";

const socket = io(getSocketUrl(), config.socketConfig);

export default socket;
