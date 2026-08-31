const request = require("supertest");

const app = require("../src/server");

describe("Health API", () => {
    test("GET /api/health should return API health status", async () => {
        const response = await request(app)
            .get("/api/health");

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: "ok",
            message: "Reflex API is running"
        });
    });

    test("API should reject malformed JSON", async () => {
        const response = await request(app)
            .post("/api/deliveries")
            .set("Content-Type", "application/json")
            .send('{"invalidJson":');

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            status: "error",
            message: "Invalid JSON payload"
        });
    });

    test("API should reject an oversized JSON request body", async () => {
        const largePayload = {
            name: "A".repeat(1024 * 1024 + 100)
        };

        const response = await request(app)
            .post("/api/deliveries")
            .set("Content-Type", "application/json")
            .send(JSON.stringify(largePayload));

        expect(response.statusCode).toBe(413);

        expect(response.body).toEqual({
            status: "error",
            message: "Request body is too large"
        });
    });
});