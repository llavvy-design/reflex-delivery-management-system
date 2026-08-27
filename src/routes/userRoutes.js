const express = require("express");

const { authenticateToken } = require("../middleware/authMiddleware");

const {
    getRiders
} = require("../controllers/userController");

const router = express.Router();

router.get("/riders", authenticateToken, getRiders);

module.exports = router;