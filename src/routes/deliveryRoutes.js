const express = require("express");

const { authenticateToken } = require("../middleware/authMiddleware");

const {
    createDelivery
} = require("../controllers/deliveryController");

const router = express.Router();

router.post("/", authenticateToken, createDelivery);

module.exports = router;