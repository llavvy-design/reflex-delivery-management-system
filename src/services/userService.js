const pool = require("../config/database");

const getRiders = async () => {
    const result = await pool.query(
        `SELECT
            id,
            name,
            email,
            phone
         FROM users
         WHERE role = 'rider'
         ORDER BY name ASC`
    );

    return result.rows;
};

module.exports = {
    getRiders
};