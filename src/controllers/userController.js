const {
    getRiders: fetchRiders
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

module.exports = {
    getRiders
};
