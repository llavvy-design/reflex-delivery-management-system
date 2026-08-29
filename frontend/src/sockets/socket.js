import { io } from "socket.io-client";

const socket = io(
    import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
    {
        autoConnect: false,
    }
);

export const connectSocket = () => {
    const token = localStorage.getItem("reflex_token");

    if (!token) {
        return;
    }

    socket.auth = {
        token,
    };

    if (!socket.connected) {
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};

export default socket;
