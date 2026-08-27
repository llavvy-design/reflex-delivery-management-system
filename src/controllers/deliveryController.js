const {
    createDelivery: saveDelivery,
    getDeliveries: fetchDeliveries
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

module.exports = {
    createDelivery,
    getDeliveries
};