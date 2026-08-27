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

const assignDelivery = async ({ deliveryId, riderId, dispatcherId }) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const riderResult = await client.query(
            `SELECT id
             FROM users
             WHERE id = $1
               AND role = 'rider'`,
            [riderId]
        );

        if (riderResult.rows.length === 0) {
            throw new Error("Rider not found");
        }

        const deliveryResult = await client.query(
            `SELECT id, status, assigned_rider_id
             FROM deliveries
             WHERE id = $1
             FOR UPDATE`,
            [deliveryId]
        );

        if (deliveryResult.rows.length === 0) {
            throw new Error("Delivery not found");
        }

        const delivery = deliveryResult.rows[0];

        if (delivery.assigned_rider_id !== null) {
            throw new Error("Delivery is already assigned");
        }

        if (delivery.status !== "Pending") {
            throw new Error("Delivery cannot be assigned in its current status");
        }

        const updateResult = await client.query(
            `UPDATE deliveries
             SET
                 assigned_rider_id = $1,
                 status = 'Assigned'
             WHERE id = $2
             RETURNING
                 id,
                 created_by,
                 assigned_rider_id,
                 customer_name,
                 customer_phone,
                 delivery_address,
                 item_description,
                 status,
                 created_at`,
            [riderId, deliveryId]
        );

        await client.query(
            `INSERT INTO delivery_status_history
                (delivery_id, changed_by, from_status, to_status)
             VALUES
                ($1, $2, $3, $4)`,
            [deliveryId, dispatcherId, delivery.status, "Assigned"]
        );

        await client.query("COMMIT");

        return updateResult.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const updateDeliveryStatus = async ({
    deliveryId,
    riderId,
    newStatus
}) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const deliveryResult = await client.query(
            `SELECT
                id,
                assigned_rider_id,
                status
             FROM deliveries
             WHERE id = $1
             FOR UPDATE`,
            [deliveryId]
        );

        if (deliveryResult.rows.length === 0) {
            throw new Error("Delivery not found");
        }

        const delivery = deliveryResult.rows[0];

        if (delivery.assigned_rider_id !== riderId) {
            throw new Error("You are not assigned to this delivery");
        }

        const allowedTransitions = {
            "Assigned": ["Picked Up"],
            "Picked Up": ["Delivered"]
        };

        const allowedNextStatuses =
            allowedTransitions[delivery.status] || [];

        if (!allowedNextStatuses.includes(newStatus)) {
            throw new Error(
                `Invalid status transition from ${delivery.status} to ${newStatus}`
            );
        }

        const updateResult = await client.query(
            `UPDATE deliveries
             SET status = $1
             WHERE id = $2
             RETURNING
                 id,
                 created_by,
                 assigned_rider_id,
                 customer_name,
                 customer_phone,
                 delivery_address,
                 item_description,
                 status,
                 created_at`,
            [newStatus, deliveryId]
        );

        await client.query(
            `INSERT INTO delivery_status_history
                (delivery_id, changed_by, from_status, to_status)
             VALUES
                ($1, $2, $3, $4)`,
            [
                deliveryId,
                riderId,
                delivery.status,
                newStatus
            ]
        );

        await client.query("COMMIT");

        return updateResult.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const getDeliveryHistory = async ({
    deliveryId,
    userId,
    role
}) => {
    const delivery = await getDeliveryById({
        deliveryId,
        userId,
        role
    });

    if (!delivery) {
        return null;
    }

    const result = await pool.query(
        `SELECT
            h.id,
            h.delivery_id,
            h.changed_by,
            u.name AS changed_by_name,
            u.role AS changed_by_role,
            h.from_status,
            h.to_status,
            h.changed_at
         FROM delivery_status_history h
         JOIN users u
           ON u.id = h.changed_by
         WHERE h.delivery_id = $1
         ORDER BY h.changed_at ASC, h.id ASC`,
        [deliveryId]
    );

    return result.rows;
};

const getDeliveryStats = async () => {
    const result = await pool.query(
        `SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (
                WHERE status = 'Pending'
            )::int AS pending,
            COUNT(*) FILTER (
                WHERE status = 'Assigned'
            )::int AS assigned,
            COUNT(*) FILTER (
                WHERE status = 'Picked Up'
            )::int AS picked_up,
            COUNT(*) FILTER (
                WHERE status = 'Delivered'
            )::int AS delivered,
            COUNT(*) FILTER (
                WHERE assigned_rider_id IS NULL
            )::int AS unassigned
         FROM deliveries`
    );

    const row = result.rows[0];

    return {
        total: row.total,
        pending: row.pending,
        assigned: row.assigned,
        pickedUp: row.picked_up,
        delivered: row.delivered,
        unassigned: row.unassigned
    };
};

module.exports = {
    createDelivery,
    getDeliveries,
    getDeliveryById,
    assignDelivery,
    updateDeliveryStatus,
    getDeliveryHistory,
    getDeliveryStats
};