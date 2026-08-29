const jwt = require("jsonwebtoken");

let io;

const initializeSocket = (socketServer) => {
    io = socketServer;

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(new Error("Authentication token is required"));
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            socket.user = decoded;

            next();
        } catch (error) {
            next(new Error("Invalid or expired authentication token"));
        }
    });

    io.on("connection", (socket) => {
        const { userId, role } = socket.user;

        console.log(
            `Socket connected: ${socket.id} | user=${userId} | role=${role}`
        );

        /*
         * Every authenticated user gets a private room.
         *
         * Example:
         * user:1
         * user:4
         */
        socket.join(`user:${userId}`);

        /*
         * Role-based rooms.
         *
         * Example:
         * dispatcher
         * retailer
         * rider
         */
        socket.join(`role:${role}`);

        /*
         * Riders also receive a dedicated rider room.
         *
         * Example:
         * rider:4
         */
        if (role === "rider") {
            socket.join(`rider:${userId}`);
        }

        socket.on("disconnect", (reason) => {
            console.log(
                `Socket disconnected: ${socket.id} | reason=${reason}`
            );
        });
    });
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized");
    }

    return io;
};

module.exports = {
    initializeSocket,
    getIO
};