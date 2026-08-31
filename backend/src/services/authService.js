const bcrypt = require("bcrypt");
const pool = require("../config/database");
const jwt = require("jsonwebtoken");

const registerUser = async ({ name, email, phone, password }) => {
    const existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
    );

    if (existingUser.rows.length > 0) {
        throw new Error("Email is already registered");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
        `INSERT INTO users
            (name, email, phone, password_hash, role)
         VALUES
            ($1, $2, $3, $4, $5)
         RETURNING id, name, email, phone, role`,
        [name, email, phone, passwordHash, "retailer"]
    );

    return result.rows[0];
};

const loginUser = async ({ email, password }) => {
    const result = await pool.query(
        "SELECT id, name, email, phone, password_hash, role FROM users WHERE email = $1",
        [email]
    );

    if (result.rows.length === 0) {
        throw new Error("Invalid email or password");
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!passwordMatches) {
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
    {
        userId: user.id,
        role: user.role
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "1h"
    }
);

return {
    user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
    },
    token
};
};

const getCurrentUser = async (userId) => {
    const result = await pool.query(
        `SELECT
            id,
            name,
            email,
            phone,
            role
         FROM users
         WHERE id = $1`,
        [userId]
    );

    return result.rows[0] || null;
};

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser
};