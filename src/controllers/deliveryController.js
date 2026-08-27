const {
    createDelivery: saveDelivery,
    getDeliveries: fetchDeliveries,
    getDeliveryById: fetchDeliveryById,
    assignDelivery: assignDeliveryToRider,
    updateDeliveryStatus: changeDeliveryStatus,
    getDeliveryHistory: fetchDeliveryHistory,
    getDeliveryStats: fetchDeliveryStats,
    updateDelivery: updateDeliveryRecord,
    cancelDelivery: cancelDeliveryRecord,
        createDeliveryConfirmation: createDeliveryConfirmationRecord
} = require("../services/deliveryService");

const createDelivery = async (req, res) => {
    try {
        const {
            customerName,
            customerPhone,
            deliveryAddress,
            itemDescription
        } = req.body;

        const requiredFields = {
            customerName,
            customerPhone,
            deliveryAddress,
            itemDescription
        };

        for (const [field, value] of Object.entries(requiredFields)) {
            if (typeof value !== "string" || value.trim() === "") {
                return res.status(400).json({
                    status: "error",
                    message: `${field} is required`
                });
            }
        }

        if (customerName.trim().length > 100) {
            return res.status(400).json({
                status: "error",
                message: "Customer name must not exceed 100 characters"
            });
        }

        if (customerPhone.trim().length > 20) {
            return res.status(400).json({
                status: "error",
                message: "Customer phone must not exceed 20 characters"
            });
        }

        if (deliveryAddress.trim().length > 5000) {
            return res.status(400).json({
                status: "error",
                message: "Delivery address is too long"
            });
        }

        if (itemDescription.trim().length > 5000) {
            return res.status(400).json({
                status: "error",
                message: "Item description is too long"
            });
        }

        const delivery = await saveDelivery({
            createdBy: req.user.userId,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            deliveryAddress: deliveryAddress.trim(),
            itemDescription: itemDescription.trim()
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
        const { status, riderId, unassigned } = req.query;

             const validStatuses = [
                  "Pending",
                  "Assigned",
                  "Picked Up",
                  "Delivered",
                  "Cancelled"
             ];

        if (status !== undefined && !validStatuses.includes(status)) {
             return res.status(400).json({
                 status: "error",
                 message: "Invalid delivery status"
            });
        }

const parsedRiderId =
    riderId !== undefined
        ? Number(riderId)
        : undefined;

        if (
            parsedRiderId !== undefined &&
            (!Number.isInteger(parsedRiderId) || parsedRiderId <= 0)
        ) {
            return res.status(400).json({
                status: "error",
                message: "riderId must be a positive integer"
            });
        }

        const deliveries = await fetchDeliveries({
            userId: req.user.userId,
            role: req.user.role,
            status,
            riderId: parsedRiderId,
            unassigned: unassigned === "true"
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

        const { riderId } = req.body;

        if (
            riderId === undefined ||
            riderId === null ||
            riderId === ""
        ) {
            return res.status(400).json({
                status: "error",
                message: "riderId is required"
            });
        }

        const parsedRiderId = Number(riderId);

        if (!Number.isInteger(parsedRiderId) || parsedRiderId <= 0) {
            return res.status(400).json({
                status: "error",
                message: "riderId must be a positive integer"
            });
        }

        const delivery = await assignDeliveryToRider({
            deliveryId: req.params.id,
            riderId: parsedRiderId,
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

        if (error.message === "Rider is currently unavailable") {
    return res.status(409).json({
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

        const { status } = req.body;

        if (typeof status !== "string" || status.trim() === "") {
            return res.status(400).json({
                status: "error",
                message: "status is required"
            });
        }

        const delivery = await changeDeliveryStatus({
            deliveryId: req.params.id,
            riderId: req.user.userId,
            newStatus: status.trim()
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

const getDeliveryStats = async (req, res) => {
    try {
        if (req.user.role !== "dispatcher") {
            return res.status(403).json({
                status: "error",
                message: "Only dispatchers can view delivery statistics"
            });
        }

        const stats = await fetchDeliveryStats();

        res.status(200).json({
            status: "ok",
            message: "Delivery statistics retrieved successfully",
            stats
        });
    } catch (error) {
        console.error("Delivery statistics retrieval failed:", error.message);

        res.status(500).json({
            status: "error",
            message: "Failed to retrieve delivery statistics"
        });
    }
};

const updateDelivery = async (req, res) => {
    try {
        if (req.user.role !== "retailer") {
            return res.status(403).json({
                status: "error",
                message: "Only retailers can edit deliveries"
            });
        }

        const {
            customerName,
            customerPhone,
            deliveryAddress,
            itemDescription
        } = req.body;

        const requiredFields = {
            customerName,
            customerPhone,
            deliveryAddress,
            itemDescription
        };

        for (const [field, value] of Object.entries(requiredFields)) {
            if (typeof value !== "string" || value.trim() === "") {
                return res.status(400).json({
                    status: "error",
                    message: `${field} is required`
                });
            }
        }

        if (customerName.trim().length > 100) {
            return res.status(400).json({
                status: "error",
                message: "Customer name must not exceed 100 characters"
            });
        }

        if (customerPhone.trim().length > 20) {
            return res.status(400).json({
                status: "error",
                message: "Customer phone must not exceed 20 characters"
            });
        }

        if (deliveryAddress.trim().length > 5000) {
            return res.status(400).json({
                status: "error",
                message: "Delivery address is too long"
            });
        }

        if (itemDescription.trim().length > 5000) {
            return res.status(400).json({
                status: "error",
                message: "Item description is too long"
            });
        }

        const delivery = await updateDeliveryRecord({
            deliveryId: req.params.id,
            retailerId: req.user.userId,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            deliveryAddress: deliveryAddress.trim(),
            itemDescription: itemDescription.trim()
        });

        if (!delivery) {
            return res.status(404).json({
                status: "error",
                message: "Delivery not found or cannot be edited"
            });
        }

        res.status(200).json({
            status: "ok",
            message: "Delivery updated successfully",
            delivery
        });
    } catch (error) {
        console.error("Delivery update failed:", error.message);

        res.status(500).json({
            status: "error",
            message: "Failed to update delivery"
        });
    }
};

const cancelDelivery = async (req, res) => {
    try {
        if (
            req.user.role !== "retailer" &&
            req.user.role !== "dispatcher"
        ) {
            return res.status(403).json({
                status: "error",
                message: "Only retailers or dispatchers can cancel deliveries"
            });
        }

        const delivery = await cancelDeliveryRecord({
            deliveryId: req.params.id,
            userId: req.user.userId,
            role: req.user.role
        });

        res.status(200).json({
            status: "ok",
            message: "Delivery cancelled successfully",
            delivery
        });
    } catch (error) {
        console.error("Delivery cancellation failed:", error.message);

        if (error.message === "Delivery not found") {
            return res.status(404).json({
                status: "error",
                message: error.message
            });
        }

        if (
            error.message ===
            "You are not authorized to cancel this delivery"
        ) {
            return res.status(403).json({
                status: "error",
                message: error.message
            });
        }

        if (
            error.message ===
            "Only retailers or dispatchers can cancel deliveries"
        ) {
            return res.status(403).json({
                status: "error",
                message: error.message
            });
        }

        if (error.message.startsWith("Delivery cannot be cancelled")) {
            return res.status(409).json({
                status: "error",
                message: error.message
            });
        }

        res.status(500).json({
            status: "error",
            message: "Failed to cancel delivery"
        });
    }
};

const createDeliveryConfirmation = async (req, res) => {
    try {
        if (req.user.role !== "rider") {
            return res.status(403).json({
                status: "error",
                message: "Only riders can confirm deliveries"
            });
        }

        const { method } = req.body;

        if (typeof method !== "string" || method.trim() === "") {
            return res.status(400).json({
                status: "error",
                message: "method is required"
            });
        }

        if (method.trim().length > 30) {
            return res.status(400).json({
                status: "error",
                message: "method must not exceed 30 characters"
            });
        }

        const confirmation = await createDeliveryConfirmationRecord({
            deliveryId: req.params.id,
            riderId: req.user.userId,
            method: method.trim()
        });

        res.status(201).json({
            status: "ok",
            message: "Delivery confirmation recorded successfully",
            confirmation
        });
    } catch (error) {
        console.error(
            "Delivery confirmation failed:",
            error.message
        );

        if (error.message === "Delivery not found") {
            return res.status(404).json({
                status: "error",
                message: error.message
            });
        }

        if (
            error.message ===
            "You are not assigned to this delivery"
        ) {
            return res.status(403).json({
                status: "error",
                message: error.message
            });
        }

        if (
            error.message ===
            "Delivery must be Delivered before confirmation"
        ) {
            return res.status(409).json({
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
            message: "Failed to record delivery confirmation"
        });
    }
};

module.exports = {
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
};