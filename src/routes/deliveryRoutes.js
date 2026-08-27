const express = require("express");

const { authenticateToken } = require("../middleware/authMiddleware");

const {
    createDelivery,
    getDeliveries,
    getDeliveryById,
    assignDelivery,
    updateDeliveryStatus,
    getDeliveryHistory,
    getDeliveryStats,
    updateDelivery,
    cancelDelivery,
    createDeliveryConfirmation
} = require("../controllers/deliveryController");

const router = express.Router();

router.post("/", authenticateToken, createDelivery);

router.get("/", authenticateToken, getDeliveries);

router.get("/stats", authenticateToken, getDeliveryStats);

router.patch("/:id", authenticateToken, updateDelivery);

router.post("/:id/cancel", authenticateToken, cancelDelivery);

router.get("/:id", authenticateToken, getDeliveryById);

router.post("/:id/assign", authenticateToken, assignDelivery);

router.patch("/:id/status", authenticateToken, updateDeliveryStatus);
router.post(
    "/:id/confirmation",
    authenticateToken,
    createDeliveryConfirmation
);

router.get("/:id/history", authenticateToken, getDeliveryHistory);



module.exports = router;