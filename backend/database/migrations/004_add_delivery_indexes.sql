CREATE INDEX deliveries_created_by_idx
ON deliveries (created_by);

CREATE INDEX deliveries_assigned_rider_id_idx
ON deliveries (assigned_rider_id);

CREATE INDEX delivery_status_history_delivery_id_idx
ON delivery_status_history (delivery_id);