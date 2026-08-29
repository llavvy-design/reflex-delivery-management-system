ALTER TABLE deliveries
DROP CONSTRAINT deliveries_status_check;

ALTER TABLE deliveries
ADD CONSTRAINT deliveries_status_check
CHECK (
    status IN (
        'Pending',
        'Assigned',
        'Picked Up',
        'Delivered',
        'Cancelled'
    )
);

ALTER TABLE delivery_status_history
DROP CONSTRAINT history_to_status_check;

ALTER TABLE delivery_status_history
ADD CONSTRAINT history_to_status_check
CHECK (
    to_status IN (
        'Pending',
        'Assigned',
        'Picked Up',
        'Delivered',
        'Cancelled'
    )
);