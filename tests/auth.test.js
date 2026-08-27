const request = require("supertest");

const app = require("../src/server");

describe("Authentication protection", () => {
    test("GET /api/deliveries should reject requests without a token", async () => {
        const response = await request(app)
            .get("/api/deliveries");

        expect(response.statusCode).toBe(401);

        expect(response.body).toEqual({
            status: "error",
            message: "Authentication token is required"
        });
    });

    test("GET /api/deliveries/stats should reject requests without a token", async () => {
        const response = await request(app)
            .get("/api/deliveries/stats");

        expect(response.statusCode).toBe(401);

        expect(response.body).toEqual({
            status: "error",
            message: "Authentication token is required"
        });
    });

    test("GET /api/users/riders should reject requests without a token", async () => {
        const response = await request(app)
            .get("/api/users/riders");

        expect(response.statusCode).toBe(401);

        expect(response.body).toEqual({
            status: "error",
            message: "Authentication token is required"
        });
    });
});