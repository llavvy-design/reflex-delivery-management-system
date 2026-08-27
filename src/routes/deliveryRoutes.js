const express = require("express");

const { authenticateToken } = require("../middleware/authMiddleware");

const {
    createDelivery,
    getDeliveries,
    getDeliveryById,
    assignDelivery,
    updateDeliveryStatus,
    getDeliveryHistory,
    getDeliveryStats
} = require("../controllers/deliveryController");

const router = express.Router();

router.post("/", authenticateToken, createDelivery);

router.get("/", authenticateToken, getDeliveries);

router.get("/stats", authenticateToken, getDeliveryStats);

router.get("/:id", authenticateToken, getDeliveryById);

router.post("/:id/assign", authenticateToken, assignDelivery);

router.patch("/:id/status", authenticateToken, updateDeliveryStatus);

router.get("/:id/history", authenticateToken, getDeliveryHistory);

module.exports = router;