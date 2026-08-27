const {
    registerUser: createUser,
    loginUser: authenticateUser
} = require("../services/authService");

const registerUser = async (req, res) => {
    try {
        const user = await createUser(req.body);

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
        const user = await authenticateUser(req.body);

        res.status(200).json({
            status: "ok",
            message: "Login successful",
            user
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

module.exports = {
    registerUser,
    loginUser
};