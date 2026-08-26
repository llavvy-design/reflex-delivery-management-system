const express = require("express");
const cors = require("cors");
const pool = require("./config/database");

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
        const result = await pool.query("SELECT NOW()");

        res.status(200).json({
            status: "ok",
            message: "Database connection is working",
            databaseTime: result.rows[0].now
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);

        res.status(500).json({
            status: "error",
            message: "Database connection failed"
        });
    }
});

app.get("/api/health/db/users", async (req, res) => {
    try {
        const result = await pool.query("SELECT COUNT(*) FROM users");

        res.status(200).json({
            status: "ok",
            message: "Successfully queried the users table",
            userCount: Number(result.rows[0].count)
        });
    } catch (error) {
        console.error("Users table query failed:", error.message);

        res.status(500).json({
            status: "error",
            message: "Could not query users table"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Reflex API running on port ${PORT}`);
});