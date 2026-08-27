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

module.exports = {
    createDelivery
};