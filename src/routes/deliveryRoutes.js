const express = require("express");

const { authenticateToken } = require("../middleware/authMiddleware");

const {
    createDelivery,
    getDeliveries,
    getDeliveryById,
    assignDelivery
} = require("../controllers/deliveryController");

const router = express.Router();

router.post("/", authenticateToken, createDelivery);

router.get("/", authenticateToken, getDeliveries);

router.get("/:id", authenticateToken, getDeliveryById);

router.post("/:id/assign", authenticateToken, assignDelivery);

module.exports = router;