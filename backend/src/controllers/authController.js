const {
    registerUser: createUser,
    loginUser: authenticateUser,
    getCurrentUser: fetchCurrentUser
} = require("../services/authService");

const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password
        } = req.body;

        const requiredFields = {
            name,
            email,
            phone,
            password
        };

        for (const [field, value] of Object.entries(requiredFields)) {
            if (typeof value !== "string" || value.trim() === "") {
                return res.status(400).json({
                    status: "error",
                    message: `${field} is required`
                });
            }
        }

        const normalizedEmail = email.trim().toLowerCase();

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(normalizedEmail)) {
            return res.status(400).json({
                status: "error",
                message: "email must be valid"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                status: "error",
                message: "password must be at least 8 characters"
            });
        }

        const user = await createUser({
            name: name.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            password
        });

        res.status(201).json({
            status: "ok",
            message: "User registered successfully",
            user
        });
    } catch (error) {
        console.error("Registration failed:", error.message);

        if (error.message === "Email is already registered") {
            return res.status(409).json({
                status: "error",
                message: error.message
            });
        }

        res.status(500).json({
            status: "error",
            message: "Registration failed"
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { user, token } = await authenticateUser(req.body);

        res.status(200).json({
            status: "ok",
            message: "Login successful",
            user,
            token
        });
    } catch (error) {
        console.error("Login failed:", error.message);

        if (error.message === "Invalid email or password") {
            return res.status(401).json({
                status: "error",
                message: error.message
            });
        }

        res.status(500).json({
            status: "error",
            message: "Login failed"
        });
    }

};

const getCurrentUser = async (req, res) => {
    try {
        const user = await fetchCurrentUser(req.user.userId);

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }

        res.status(200).json({
            status: "ok",
            message: "Authentication verified",
            user
        });
    } catch (error) {
        console.error(
            "Current user retrieval failed:",
            error.message
        );

        res.status(500).json({
            status: "error",
            message: "Failed to verify authentication"
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser
};