const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");

const {
    registerUser,
    loginUser,
    getCurrentUser
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authenticateToken, getCurrentUser);

module.exports = router;