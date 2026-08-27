const express = require("express");

const { authenticateToken } = require("../middleware/authMiddleware");

const {
    getRiders,
    updateRiderAvailability
} = require("../controllers/userController");

const router = express.Router();

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