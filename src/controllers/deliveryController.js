const {
    createDelivery: saveDelivery,
    getDeliveries: fetchDeliveries,
    getDeliveryById: fetchDeliveryById,
    assignDelivery: assignDeliveryToRider,
    updateDeliveryStatus: changeDeliveryStatus,
    getDeliveryHistory: fetchDeliveryHistory
} = require("../services/deliveryService");

const createDelivery = async (req, res) => {
    try {
        const delivery = await saveDelivery({
            createdBy: req.user.userId,
            customerName: req.body.customerName,
            customerPhone: req.body.customerPhone,
            deliveryAddress: req.body.deliveryAddress,
            itemDescription: req.body.itemDescription
        });

        res.status(201).json({
            status: "ok",
            message: "Delivery created successfully",
            delivery
        });
    } catch (error) {
        console.error("Delivery creation failed:", error.message);

        res.status(500).json({
            status: "error",
            message: "Failed to create delivery"
        });
    }
};

const getDeliveries = async (req, res) => {
    try {
        const deliveries = await fetchDeliveries({
            userId: req.user.userId,
            role: req.user.role
        });

        res.status(200).json({
            status: "ok",
            message: "Deliveries retrieved successfully",
            deliveries
        });
    } catch (error) {
        console.error("Delivery retrieval failed:", error.message);

        res.status(500).json({
            status: "error",
            message: "Failed to retrieve deliveries"
        });
    }
};

const getDeliveryById = async (req, res) => {
    try {
        const delivery = await fetchDeliveryById({
            deliveryId: req.params.id,
            userId: req.user.userId,
            role: req.user.role
        });

        if (!delivery) {
            return res.status(404).json({
                status: "error",
                message: "Delivery not found"
            });
        }

        res.status(200).json({
            status: "ok",
            message: "Delivery retrieved successfully",
            delivery
        });
    } catch (error) {
        console.error("Delivery retrieval failed:", error.message);

        res.status(500).json({
            status: "error",
            message: "Failed to retrieve delivery"
        });
    }
};

const assignDelivery = async (req, res) => {
    try {
        if (req.user.role !== "dispatcher") {
            return res.status(403).json({
                status: "error",
                message: "Only dispatchers can assign deliveries"
            });
        }

        const delivery = await assignDeliveryToRider({
            deliveryId: req.params.id,
            riderId: req.body.riderId,
            dispatcherId: req.user.userId
        });

        res.status(200).json({
            status: "ok",
            message: "Delivery assigned successfully",
            delivery
        });
    } catch (error) {
        console.error("Delivery assignment failed:", error.message);

        if (error.message === "Rider not found") {
            return res.status(404).json({
                status: "error",
                message: error.message
            });
        }

        if (error.message === "Delivery not found") {
            return res.status(404).json({
                status: "error",
                message: error.message
            });
        }

        if (error.message === "Delivery is already assigned") {
            return res.status(409).json({
                status: "error",
                message: error.message
            });
        }

        if (error.message === "Delivery cannot be assigned in its current status") {
            return res.status(409).json({
                status: "error",
                message: error.message
            });
        }

        res.status(500).json({
            status: "error",
            message: "Failed to assign delivery"
        });
    }
};

const updateDeliveryStatus = async (req, res) => {
    try {
        if (req.user.role !== "rider") {
            return res.status(403).json({
                status: "error",
                message: "Only riders can update delivery status"
            });
        }

        const delivery = await changeDeliveryStatus({
            deliveryId: req.params.id,
            riderId: req.user.userId,
            newStatus: req.body.status
        });

        res.status(200).json({
            status: "ok",
            message: "Delivery status updated successfully",
            delivery
        });
    } catch (error) {
        console.error("Delivery status update failed:", error.message);

        if (error.message === "Delivery not found") {
            return res.status(404).json({
                status: "error",
                message: error.message
            });
        }

        if (error.message === "You are not assigned to this delivery") {
            return res.status(403).json({
                status: "error",
                message: error.message
            });
        }

        if (error.message.startsWith("Invalid status transition")) {
            return res.status(409).json({
                status: "error",
                message: error.message
            });
        }

        res.status(500).json({
            status: "error",
            message: "Failed to update delivery status"
        });
    }
};

const getDeliveryHistory = async (req, res) => {
    try {
        const history = await fetchDeliveryHistory({
            deliveryId: req.params.id,
            userId: req.user.userId,
            role: req.user.role
        });

        if (history === null) {
            return res.status(404).json({
                status: "error",
                message: "Delivery not found"
            });
        }

        res.status(200).json({
            status: "ok",
            message: "Delivery history retrieved successfully",
            history
        });
    } catch (error) {
        console.error("Delivery history retrieval failed:", error.message);

        res.status(500).json({
            status: "error",
            message: "Failed to retrieve delivery history"
        });
    }
};

module.exports = {
    createDelivery,
    getDeliveries,
    getDeliveryById,
    assignDelivery,
    updateDeliveryStatus,
    getDeliveryHistory
};