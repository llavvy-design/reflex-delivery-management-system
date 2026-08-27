const {
    confirmDelivery: confirmDeliveryRecord,
    getDeliveryConfirmation: fetchDeliveryConfirmation
} = require("../services/confirmationService");

const confirmDelivery = async (req, res) => {
    try {
        if (req.user.role !== "retailer") {
            return res.status(403).json({
                status: "error",
                message: "Only retailers can confirm deliveries"
            });
        }

        const { confirmationCode } = req.body;

        if (
            typeof confirmationCode !== "string" ||
            confirmationCode.trim() === ""
        ) {
            return res.status(400).json({
                status: "error",
                message: "confirmationCode is required"
            });
        }

        const confirmation = await confirmDeliveryRecord({
            deliveryId: req.params.id,
            retailerId: req.user.userId,
            confirmationCode: confirmationCode.trim()
        });

        res.status(201).json({
            status: "ok",
            message: "Delivery confirmed successfully",
            confirmation
        });
    } catch (error) {
        console.error("Delivery confirmation failed:", error.message);

        if (error.message === "Delivery not found") {
            return res.status(404).json({
                status: "error",
                message: error.message
            });
        }

        if (
            error.message ===
            "You are not authorized to confirm this delivery"
        ) {
            return res.status(403).json({
                status: "error",
                message: error.message
            });
        }

        if (
            error.message ===
            "Only delivered deliveries can be confirmed"
        ) {
            return res.status(409).json({
                status: "error",
                message: error.message
            });
        }

        if (error.message === "Invalid confirmation code") {
            return res.status(401).json({
                status: "error",
                message: error.message
            });
        }

        if (
            error.message ===
            "Delivery has already been confirmed"
        ) {
            return res.status(409).json({
                status: "error",
                message: error.message
            });
        }

        res.status(500).json({
            status: "error",
            message: "Failed to confirm delivery"
        });
    }
};

const getDeliveryConfirmation = async (req, res) => {
    try {
        if (req.user.role !== "retailer") {
            return res.status(403).json({
                status: "error",
                message: "Only retailers can view delivery confirmation"
            });
        }

        const confirmation = await fetchDeliveryConfirmation({
            deliveryId: req.params.id,
            retailerId: req.user.userId
        });

        if (!confirmation) {
            return res.status(404).json({
                status: "error",
                message: "Delivery confirmation not found"
            });
        }

        res.status(200).json({
            status: "ok",
            message: "Delivery confirmation retrieved successfully",
            confirmation
        });
    } catch (error) {
        console.error(
            "Delivery confirmation retrieval failed:",
            error.message
        );

        res.status(500).json({
            status: "error",
            message: "Failed to retrieve delivery confirmation"
        });
    }
};

module.exports = {
    confirmDelivery,
    getDeliveryConfirmation
};