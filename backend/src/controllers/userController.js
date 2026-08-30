const {
    getRiders: fetchRiders,
    updateRiderAvailability: changeRiderAvailability,
    getCurrentRider: fetchCurrentRider
} = require("../services/userService");

const getRiders = async (req, res) => {
    try {
        if (req.user.role !== "dispatcher") {
            return res.status(403).json({
                status: "error",
                message: "Only dispatchers can view riders"
            });
        }

        const riders = await fetchRiders();

        res.status(200).json({
            status: "ok",
            message: "Riders retrieved successfully",
            riders
        });
    } catch (error) {
        console.error("Rider retrieval failed:", error.message);

        res.status(500).json({
            status: "error",
            message: "Failed to retrieve riders"
        });
    }
};

const updateRiderAvailability = async (req, res) => {
    try {
        if (req.user.role !== "rider") {
            return res.status(403).json({
                status: "error",
                message: "Only riders can update their availability"
            });
        }

        const { isAvailable } = req.body;

        if (typeof isAvailable !== "boolean") {
            return res.status(400).json({
                status: "error",
                message: "isAvailable must be a boolean"
            });
        }

        const rider = await changeRiderAvailability({
            riderId: req.user.userId,
            isAvailable
        });

        if (!rider) {
            return res.status(404).json({
                status: "error",
                message: "Rider not found"
            });
        }

        res.status(200).json({
            status: "ok",
            message: "Rider availability updated successfully",
            rider: {
                id: rider.id,
                name: rider.name,
                email: rider.email,
                phone: rider.phone,
                isAvailable: rider.is_available
            }
        });
    } catch (error) {
        console.error(
            "Rider availability update failed:",
            error.message
        );

        res.status(500).json({
            status: "error",
            message: "Failed to update rider availability"
        });
    }
};
 const getCurrentRider = async (req, res) => {
    try {
        if (req.user.role !== "rider") {
            return res.status(403).json({
                status: "error",
                message: "Only riders can view their availability"
            });
        }

        const rider = await fetchCurrentRider(req.user.userId);

        if (!rider) {
            return res.status(404).json({
                status: "error",
                message: "Rider not found"
            });
        }

        res.status(200).json({
            status: "ok",
            message: "Rider retrieved successfully",
            rider: {
                id: rider.id,
                name: rider.name,
                email: rider.email,
                phone: rider.phone,
                isAvailable: rider.is_available
            }
        });
    } catch (error) {
        console.error(
            "Current rider retrieval failed:",
            error.message
        );

        res.status(500).json({
            status: "error",
            message: "Failed to retrieve rider"
        });
    }
};

module.exports = {
    getRiders,
    updateRiderAvailability,
    getCurrentRider
};