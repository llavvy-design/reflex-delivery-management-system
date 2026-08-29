ALTER TABLE users
ADD COLUMN is_available BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE users
ADD CONSTRAINT users_rider_availability_check
CHECK (
    role = 'rider'
    OR is_available = TRUE
);