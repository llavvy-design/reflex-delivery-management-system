const express = require("express");
const cors = require("cors");

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

app.listen(PORT, () => {
    console.log(`Reflex API running on port ${PORT}`);
});