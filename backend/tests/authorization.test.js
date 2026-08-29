const request = require("supertest");

const app = require("../src/server");

describe("Role-based authorization", () => {
    let retailerToken;
    let dispatcherToken;
    let riderToken;

    beforeAll(async () => {
        const retailerLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: "test@example.com",
                password: "TestPassword123"
            });

        const dispatcherLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: "dispatcher@example.com",
                password: "DispatcherPassword123"
            });

        const riderLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: "rider@example.com",
                password: "RiderPassword123"
            });

        retailerToken = retailerLogin.body.token;
        dispatcherToken = dispatcherLogin.body.token;
        riderToken = riderLogin.body.token;
    });

    test("retailer should not access dispatcher delivery statistics", async () => {
        const response = await request(app)
            .get("/api/deliveries/stats")
            .set("Authorization", `Bearer ${retailerToken}`);

        expect(response.statusCode).toBe(403);

        expect(response.body).toEqual({
            status: "error",
            message: "Only dispatchers can view delivery statistics"
        });
    });

    test("rider should not access dispatcher delivery statistics", async () => {
        const response = await request(app)
            .get("/api/deliveries/stats")
            .set("Authorization", `Bearer ${riderToken}`);

        expect(response.statusCode).toBe(403);

        expect(response.body).toEqual({
            status: "error",
            message: "Only dispatchers can view delivery statistics"
        });
    });

    test("retailer should not access the rider list", async () => {
        const response = await request(app)
            .get("/api/users/riders")
            .set("Authorization", `Bearer ${retailerToken}`);

        expect(response.statusCode).toBe(403);

        expect(response.body).toEqual({
            status: "error",
            message: "Only dispatchers can view riders"
        });
    });

    test("rider should not access the rider list", async () => {
        const response = await request(app)
            .get("/api/users/riders")
            .set("Authorization", `Bearer ${riderToken}`);

        expect(response.statusCode).toBe(403);

        expect(response.body).toEqual({
            status: "error",
            message: "Only dispatchers can view riders"
        });
    });

    test("rider should not assign deliveries", async () => {
        const response = await request(app)
            .post("/api/deliveries/2/assign")
            .set("Authorization", `Bearer ${riderToken}`)
            .send({
                riderId: 4
            });

        expect(response.statusCode).toBe(403);

        expect(response.body).toEqual({
            status: "error",
            message: "Only dispatchers can assign deliveries"
        });
    });

    test("dispatcher should not update delivery status", async () => {
        const response = await request(app)
            .patch("/api/deliveries/1/status")
            .set("Authorization", `Bearer ${dispatcherToken}`)
            .send({
                status: "Picked Up"
            });

        expect(response.statusCode).toBe(403);

        expect(response.body).toEqual({
            status: "error",
            message: "Only riders can update delivery status"
        });
    });
});