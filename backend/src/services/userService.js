const pool = require("../config/database");

const getRiders = async () => {
    const result = await pool.query(
        `SELECT
            u.id,
            u.name,
            u.email,
            u.phone,
            u.is_available,
            COUNT(d.id) FILTER (
                WHERE d.status IN ('Assigned', 'Picked Up')
            ) AS active_deliveries
         FROM users u
         LEFT JOIN deliveries d
           ON d.assigned_rider_id = u.id
         WHERE u.role = 'rider'
         GROUP BY
            u.id,
            u.name,
            u.email,
            u.phone,
            u.is_available
         ORDER BY u.name ASC`
    );

    return result.rows.map((rider) => ({
        id: rider.id,
        name: rider.name,
        email: rider.email,
        phone: rider.phone,
        isAvailable: rider.is_available,
        activeDeliveries: Number(rider.active_deliveries)
    }));
};

const updateRiderAvailability = async ({
    riderId,
    isAvailable
}) => {
    const result = await pool.query(
        `UPDATE users
         SET is_available = $1
         WHERE id = $2
           AND role = 'rider'
         RETURNING
            id,
            name,
            email,
            phone,
            is_available`,
        [isAvailable, riderId]
    );

    return result.rows[0] || null;
};

const getCurrentRider = async (riderId) => {
    const result = await pool.query(
        `SELECT
            id,
            name,
            email,
            phone,
            is_available
         FROM users
         WHERE id = $1
           AND role = 'rider'`,
        [riderId]
    );

    return result.rows[0] || null;
};

module.exports = {
    getRiders,
    updateRiderAvailability,
    getCurrentRider
};