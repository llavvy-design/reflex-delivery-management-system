import { io } from "socket.io-client";

const socket = io(
    import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
    {
        autoConnect: false,
        auth: {
            token: localStorage.getItem("reflex_token"),
        },
    }
);

export default socket;
