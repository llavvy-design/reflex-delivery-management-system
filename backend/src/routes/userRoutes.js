const express = require("express");

const { authenticateToken } = require("../middleware/authMiddleware");

const {
    getRiders,
    updateRiderAvailability,
    getCurrentRider
} = require("../controllers/userController");

const router = express.Router();

router.get(
    "/riders/me",
    authenticateToken,
    getCurrentRider
);

router.get(
    "/riders",
    authenticateToken,
    getRiders
);

router.patch(
    "/riders/me/availability",
    authenticateToken,
    updateRiderAvailability
);

module.exports = router;