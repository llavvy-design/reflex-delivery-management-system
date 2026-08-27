require("dotenv").config();

const express = require("express");
const cors = require("cors");

const pool = require("./config/database");

const authRoutes = require("./routes/authRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Reflex API running on port ${PORT}`);
    });
}