require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");

const pool = require("./config/database");

const authRoutes = require("./routes/authRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const userRoutes = require("./routes/userRoutes");
const { initializeSocket } = require("./sockets/socketHandler");

const app = express();

const PORT = process.env.PORT || 5000;

const frontendUrl =
    process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
    cors({
        origin: frontendUrl
    })
);
app.disable("x-powered-by");

app.use(
    express.json({
        limit: "1mb"
    })
);

app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Reflex API is running"
    });
});

app.get("/api/health/db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW() AS time");

        res.status(200).json({
            status: "ok",
            message: "Database connection is working",
            databaseTime: result.rows[0].time
        });
    } catch (error) {
        console.error("Database health check failed:", error.message);

        res.status(500).json({
            status: "error",
            message: "Database connection failed"
        });
    }
});

app.get("/api/health/db/users", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT COUNT(*)::int AS count FROM users"
        );

        res.status(200).json({
            status: "ok",
            message: "Successfully queried the users table",
            userCount: result.rows[0].count
        });
    } catch (error) {
        console.error("Users table query failed:", error.message);

        res.status(500).json({
            status: "error",
            message: "Failed to query users table"
        });
    }
});

app.use("/api/auth", authRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/users", userRoutes);

app.use((error, req, res, next) => {
    console.error("Unhandled API error:", error.message);

    if (res.headersSent) {
        return next(error);
    }

    if (error.type === "entity.too.large") {
        return res.status(413).json({
            status: "error",
            message: "Request body is too large"
        });
    }

    if (error instanceof SyntaxError && error.status === 400) {
        return res.status(400).json({
            status: "error",
            message: "Invalid JSON payload"
        });
    }

    return res.status(500).json({
        status: "error",
        message: "Internal server error"
    });
});

/*
 * HTTP server
 *
 * Socket.IO attaches to the HTTP server rather than directly
 * to the Express application.
 */
const httpServer = http.createServer(app);

/*
 * Socket.IO server
 */
const io = new Server(httpServer, {
    cors: {
        origin: frontendUrl
    }
});

/*
 * Socket connection handling
 */

initializeSocket(io);

module.exports = app;

module.exports.io = io;
module.exports.httpServer = httpServer;

if (require.main === module) {
    httpServer.listen(PORT, () => {
        console.log(`Reflex API running on port ${PORT}`);
    });
}
