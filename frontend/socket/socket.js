import { io } from "socket.io-client";

const socket = io( process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000", {
  withCredentials: true,
  autoConnect: false, // Optional: prevents auto-connection issues
});

export default socket;