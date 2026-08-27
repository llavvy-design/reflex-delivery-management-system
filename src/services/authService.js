const bcrypt = require("bcrypt");
const pool = require("../config/database");

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

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
    };
};

module.exports = {
    registerUser,
    loginUser
};