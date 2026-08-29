const pool = require("../src/config/database");

afterAll(async () => {
    await pool.end();
});