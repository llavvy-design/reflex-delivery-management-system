const express = require("express");

const { authenticateToken } = require("../middleware/authMiddleware");

const {
    createDelivery,
    getDeliveries
} = require("../controllers/deliveryController");

const router = express.Router();

router.post("/", authenticateToken, createDelivery);

router.get("/", authenticateToken, getDeliveries);

module.exports = router;