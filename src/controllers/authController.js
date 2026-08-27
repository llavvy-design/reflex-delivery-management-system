const { registerUser: createUser } = require("../services/authService");

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

module.exports = {
    registerUser
};