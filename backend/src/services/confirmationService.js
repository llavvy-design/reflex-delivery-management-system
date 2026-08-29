const pool = require("../config/database");

const confirmDelivery = async ({
    deliveryId,
    retailerId,
    confirmationCode
}) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const deliveryResult = await client.query(
    `SELECT
        id,
        created_by,
        assigned_rider_id,
        customer_name,
        customer_phone,
        delivery_address,
        item_description,
        status,
        confirmation_code,
        created_at
     FROM deliveries
     WHERE id = $1
     FOR UPDATE`,
    [deliveryId]
);

        if (deliveryResult.rows.length === 0) {
            throw new Error("Delivery not found");
        }

        const delivery = deliveryResult.rows[0];

        if (delivery.created_by !== retailerId) {
            throw new Error(
                "You are not authorized to confirm this delivery"
            );
        }

        if (delivery.status !== "Delivered") {
            throw new Error(
                "Only delivered deliveries can be confirmed"
            );
        }

        if (delivery.confirmation_code !== confirmationCode) {
            throw new Error("Invalid confirmation code");
        }

        const existingConfirmation = await client.query(
            `SELECT id
             FROM confirmations
             WHERE delivery_id = $1`,
            [deliveryId]
        );

        if (existingConfirmation.rows.length > 0) {
            throw new Error("Delivery has already been confirmed");
        }

        const confirmationResult = await client.query(
            `INSERT INTO confirmations
                (
                    delivery_id,
                    confirmed_by,
                    method
                )
             VALUES
                ($1, $2, $3)
             RETURNING
                id,
                delivery_id,
                confirmed_by,
                method,
                confirmed_at`,
            [
                deliveryId,
                retailerId,
                "code"
            ]
        );

        await client.query("COMMIT");

        return {
    confirmation: confirmationResult.rows[0],
    delivery
};
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const getDeliveryConfirmation = async ({
    deliveryId,
    retailerId
}) => {
    const result = await pool.query(
        `SELECT
            c.id,
            c.delivery_id,
            c.confirmed_by,
            u.name AS confirmed_by_name,
            c.method,
            c.confirmed_at
         FROM confirmations c
         JOIN users u
           ON u.id = c.confirmed_by
         JOIN deliveries d
           ON d.id = c.delivery_id
         WHERE c.delivery_id = $1
           AND d.created_by = $2`,
        [deliveryId, retailerId]
    );

    return result.rows[0] || null;
};

module.exports = {
    confirmDelivery,
    getDeliveryConfirmation
};