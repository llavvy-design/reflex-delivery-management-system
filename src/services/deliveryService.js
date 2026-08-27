const pool = require("../config/database");

const createDelivery = async ({
    createdBy,
    customerName,
    customerPhone,
    deliveryAddress,
    itemDescription
}) => {
    const result = await pool.query(
        `INSERT INTO deliveries
            (
                created_by,
                customer_name,
                customer_phone,
                delivery_address,
                item_description
            )
         VALUES
            ($1, $2, $3, $4, $5)
         RETURNING
            id,
            created_by,
            customer_name,
            customer_phone,
            delivery_address,
            item_description,
            status,
            created_at`,
        [
            createdBy,
            customerName,
            customerPhone,
            deliveryAddress,
            itemDescription
        ]
    );

    return result.rows[0];
};

const getDeliveries = async ({ userId, role }) => {
    let query;
    let values;

    if (role === "retailer") {
        query = `
            SELECT
                id,
                created_by,
                customer_name,
                customer_phone,
                delivery_address,
                item_description,
                status,
                created_at
            FROM deliveries
            WHERE created_by = $1
            ORDER BY created_at DESC
        `;

        values = [userId];
    } else if (role === "dispatcher") {
        query = `
            SELECT
                id,
                created_by,
                assigned_rider_id,
                customer_name,
                customer_phone,
                delivery_address,
                item_description,
                status,
                created_at
            FROM deliveries
            ORDER BY created_at DESC
        `;

        values = [];
    } else if (role === "rider") {
        query = `
            SELECT
                id,
                created_by,
                assigned_rider_id,
                customer_name,
                customer_phone,
                delivery_address,
                item_description,
                status,
                created_at
            FROM deliveries
            WHERE assigned_rider_id = $1
            ORDER BY created_at DESC
        `;

        values = [userId];
    } else {
        throw new Error("Invalid user role");
    }

    const result = await pool.query(query, values);

    return result.rows;
};

const getDeliveryById = async ({ deliveryId, userId, role }) => {
    let query;
    let values;

    if (role === "retailer") {
        query = `
            SELECT
                id,
                created_by,
                assigned_rider_id,
                customer_name,
                customer_phone,
                delivery_address,
                item_description,
                status,
                created_at
            FROM deliveries
            WHERE id = $1
              AND created_by = $2
        `;

        values = [deliveryId, userId];
    } else if (role === "dispatcher") {
        query = `
            SELECT
                id,
                created_by,
                assigned_rider_id,
                customer_name,
                customer_phone,
                delivery_address,
                item_description,
                status,
                created_at
            FROM deliveries
            WHERE id = $1
        `;

        values = [deliveryId];
    } else if (role === "rider") {
        query = `
            SELECT
                id,
                created_by,
                assigned_rider_id,
                customer_name,
                customer_phone,
                delivery_address,
                item_description,
                status,
                created_at
            FROM deliveries
            WHERE id = $1
              AND assigned_rider_id = $2
        `;

        values = [deliveryId, userId];
    } else {
        throw new Error("Invalid user role");
    }

    const result = await pool.query(query, values);

    return result.rows[0] || null;
};

module.exports = {
    createDelivery,
    getDeliveries,
    getDeliveryById
};