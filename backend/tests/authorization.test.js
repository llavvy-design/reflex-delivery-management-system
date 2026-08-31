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

    test("rider can view their own availability", async () => {
    const response = await request(app)
        .get("/api/users/riders/me")
        .set("Authorization", `Bearer ${riderToken}`);

    expect(response.statusCode).toBe(200);

    expect(response.body).toMatchObject({
        status: "ok",
        message: "Rider retrieved successfully"
    });

    expect(response.body.rider).toMatchObject({
        id: 4,
        name: "Test Rider",
        email: "rider@example.com",
        phone: "0766000000"
    });

    expect(typeof response.body.rider.isAvailable).toBe(
        "boolean"
    );
});

test("retailer should not view rider availability endpoint", async () => {
    const response = await request(app)
        .get("/api/users/riders/me")
        .set("Authorization", `Bearer ${retailerToken}`);

    expect(response.statusCode).toBe(403);

    expect(response.body).toEqual({
        status: "error",
        message: "Only riders can view their availability"
    });
});

test("dispatcher should not view rider availability endpoint", async () => {
    const response = await request(app)
        .get("/api/users/riders/me")
        .set("Authorization", `Bearer ${dispatcherToken}`);

    expect(response.statusCode).toBe(403);

    expect(response.body).toEqual({
        status: "error",
        message: "Only riders can view their availability"
    });
});

test("rider can update their own availability", async () => {
    const response = await request(app)
        .patch("/api/users/riders/me/availability")
        .set("Authorization", `Bearer ${riderToken}`)
        .send({
            isAvailable: false
        });

    expect(response.statusCode).toBe(200);

    expect(response.body).toMatchObject({
        status: "ok",
        message: "Rider availability updated successfully"
    });

    expect(response.body.rider).toMatchObject({
        id: 4,
        name: "Test Rider",
        email: "rider@example.com",
        phone: "0766000000",
        isAvailable: false
    });

    // Restore the rider so later tests start from the normal state.
    const restoreResponse = await request(app)
        .patch("/api/users/riders/me/availability")
        .set("Authorization", `Bearer ${riderToken}`)
        .send({
            isAvailable: true
        });

    expect(restoreResponse.statusCode).toBe(200);
});

test("retailer should not update rider availability", async () => {
    const response = await request(app)
        .patch("/api/users/riders/me/availability")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            isAvailable: false
        });

    expect(response.statusCode).toBe(403);

    expect(response.body).toEqual({
        status: "error",
        message: "Only riders can update their availability"
    });
});

test("dispatcher should not update rider availability", async () => {
    const response = await request(app)
        .patch("/api/users/riders/me/availability")
        .set("Authorization", `Bearer ${dispatcherToken}`)
        .send({
            isAvailable: false
        });

    expect(response.statusCode).toBe(403);

    expect(response.body).toEqual({
        status: "error",
        message: "Only riders can update their availability"
    });
});

test("rider availability should reject a non-boolean value", async () => {
    const response = await request(app)
        .patch("/api/users/riders/me/availability")
        .set("Authorization", `Bearer ${riderToken}`)
        .send({
            isAvailable: "false"
        });

    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual({
        status: "error",
        message: "isAvailable must be a boolean"
    });
});


});