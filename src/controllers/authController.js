const registerUser = async (req, res) => {
    res.status(201).json({
        status: "ok",
        message: "Registration endpoint reached"
    });
};

module.exports = {
    registerUser
};