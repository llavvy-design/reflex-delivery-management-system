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
});