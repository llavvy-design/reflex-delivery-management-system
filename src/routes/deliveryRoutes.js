const express = require("express");

const { authenticateToken } = require("../middleware/authMiddleware");

const {
    createDelivery,
    getDeliveries,
    getDeliveryById,
    assignDelivery,
    updateDeliveryStatus
} = require("../controllers/deliveryController");

const router = express.Router();

router.post("/", authenticateToken, createDelivery);

router.get("/", authenticateToken, getDeliveries);

router.get("/:id", authenticateToken, getDeliveryById);

router.post("/:id/assign", authenticateToken, assignDelivery);

router.patch("/:id/status", authenticateToken, updateDeliveryStatus);

module.exports = router;