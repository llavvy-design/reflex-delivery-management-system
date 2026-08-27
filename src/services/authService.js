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

module.exports = {
    registerUser
};