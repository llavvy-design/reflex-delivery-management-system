const request = require("supertest");

const app = require("../src/server");

describe("Delivery lifecycle", () => {
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

    test("retailer can create a delivery", async () => {
        const response = await request(app)
            .post("/api/deliveries")
            .set("Authorization", `Bearer ${retailerToken}`)
            .send({
                customerName: "Automated Test Customer",
                customerPhone: "0712345678",
                deliveryAddress: "Mombasa CBD",
                itemDescription: "Automated Test Package"
            });

        expect(response.statusCode).toBe(201);

        expect(response.body.status).toBe("ok");
        expect(response.body.message).toBe(
            "Delivery created successfully"
        );

        expect(response.body.delivery).toHaveProperty("id");
        expect(response.body.delivery.status).toBe("Pending");
        expect(response.body.delivery.confirmation_code).toMatch(
            /^\d{6}$/
        );
    });

    test("dispatcher can assign a pending delivery to an available rider", async () => {
    const createResponse = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Assignment Test Customer",
            customerPhone: "0712345679",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Assignment Test Package"
        });

    expect(createResponse.statusCode).toBe(201);

    const deliveryId = createResponse.body.delivery.id;

    const assignResponse = await request(app)
        .post(`/api/deliveries/${deliveryId}/assign`)
        .set("Authorization", `Bearer ${dispatcherToken}`)
        .send({
            riderId: 4
        });

    expect(assignResponse.statusCode).toBe(200);

    expect(assignResponse.body.status).toBe("ok");
    expect(assignResponse.body.message).toBe(
        "Delivery assigned successfully"
    );

    expect(assignResponse.body.delivery.id).toBe(deliveryId);
    expect(assignResponse.body.delivery.assigned_rider_id).toBe(4);
    expect(assignResponse.body.delivery.status).toBe("Assigned");
});

test("dispatcher cannot assign a delivery to an unavailable rider", async () => {
    const availabilityResponse = await request(app)
        .patch("/api/users/riders/me/availability")
        .set("Authorization", `Bearer ${riderToken}`)
        .send({
            isAvailable: false
        });

    expect(availabilityResponse.statusCode).toBe(200);

    const createResponse = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Unavailable Rider Test Customer",
            customerPhone: "0712345680",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Unavailable Rider Test Package"
        });

    expect(createResponse.statusCode).toBe(201);

    const deliveryId = createResponse.body.delivery.id;

    const assignResponse = await request(app)
        .post(`/api/deliveries/${deliveryId}/assign`)
        .set("Authorization", `Bearer ${dispatcherToken}`)
        .send({
            riderId: 4
        });

    expect(assignResponse.statusCode).toBe(409);

    expect(assignResponse.body).toEqual({
        status: "error",
        message: "Rider is currently unavailable"
    });

    // Restore rider availability for subsequent tests.
    const restoreResponse = await request(app)
        .patch("/api/users/riders/me/availability")
        .set("Authorization", `Bearer ${riderToken}`)
        .send({
            isAvailable: true
        });

    expect(restoreResponse.statusCode).toBe(200);
});

test("assigned rider can move a delivery from Picked Up to Delivered", async () => {
    const createResponse = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Status Lifecycle Test Customer",
            customerPhone: "0712345681",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Status Lifecycle Test Package"
        });

    expect(createResponse.statusCode).toBe(201);

    const deliveryId = createResponse.body.delivery.id;

    const assignResponse = await request(app)
        .post(`/api/deliveries/${deliveryId}/assign`)
        .set("Authorization", `Bearer ${dispatcherToken}`)
        .send({
            riderId: 4
        });

    expect(assignResponse.statusCode).toBe(200);
    expect(assignResponse.body.delivery.status).toBe("Assigned");

    const pickedUpResponse = await request(app)
        .patch(`/api/deliveries/${deliveryId}/status`)
        .set("Authorization", `Bearer ${riderToken}`)
        .send({
            status: "Picked Up"
        });

    expect(pickedUpResponse.statusCode).toBe(200);
    expect(pickedUpResponse.body.delivery.status).toBe("Picked Up");

    const deliveredResponse = await request(app)
        .patch(`/api/deliveries/${deliveryId}/status`)
        .set("Authorization", `Bearer ${riderToken}`)
        .send({
            status: "Delivered"
        });

    expect(deliveredResponse.statusCode).toBe(200);
    expect(deliveredResponse.body.delivery.status).toBe("Delivered");
});

test("rider cannot skip the Picked Up status", async () => {
    const createResponse = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Invalid Transition Test Customer",
            customerPhone: "0712345682",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Invalid Transition Test Package"
        });

    expect(createResponse.statusCode).toBe(201);

    const deliveryId = createResponse.body.delivery.id;

    const assignResponse = await request(app)
        .post(`/api/deliveries/${deliveryId}/assign`)
        .set("Authorization", `Bearer ${dispatcherToken}`)
        .send({
            riderId: 4
        });

    expect(assignResponse.statusCode).toBe(200);
    expect(assignResponse.body.delivery.status).toBe("Assigned");

    const deliveredResponse = await request(app)
        .patch(`/api/deliveries/${deliveryId}/status`)
        .set("Authorization", `Bearer ${riderToken}`)
        .send({
            status: "Delivered"
        });

    expect(deliveredResponse.statusCode).toBe(409);

    expect(deliveredResponse.body.status).toBe("error");
    expect(deliveredResponse.body.message).toBe(
        "Invalid status transition from Assigned to Delivered"
    );
});

test("retailer can confirm a delivered delivery with the correct code", async () => {
    const createResponse = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Confirmation Test Customer",
            customerPhone: "0712345683",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Confirmation Test Package"
        });

    expect(createResponse.statusCode).toBe(201);

    const deliveryId = createResponse.body.delivery.id;
    const confirmationCode =
        createResponse.body.delivery.confirmation_code;

    const assignResponse = await request(app)
        .post(`/api/deliveries/${deliveryId}/assign`)
        .set("Authorization", `Bearer ${dispatcherToken}`)
        .send({
            riderId: 4
        });

    expect(assignResponse.statusCode).toBe(200);

    const pickedUpResponse = await request(app)
        .patch(`/api/deliveries/${deliveryId}/status`)
        .set("Authorization", `Bearer ${riderToken}`)
        .send({
            status: "Picked Up"
        });

    expect(pickedUpResponse.statusCode).toBe(200);

    const deliveredResponse = await request(app)
        .patch(`/api/deliveries/${deliveryId}/status`)
        .set("Authorization", `Bearer ${riderToken}`)
        .send({
            status: "Delivered"
        });

    expect(deliveredResponse.statusCode).toBe(200);

    const confirmResponse = await request(app)
        .post(`/api/deliveries/${deliveryId}/confirm`)
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            confirmationCode
        });

    expect(confirmResponse.statusCode).toBe(201);

    expect(confirmResponse.body.status).toBe("ok");
    expect(confirmResponse.body.message).toBe(
        "Delivery confirmed successfully"
    );

    expect(confirmResponse.body.confirmation.delivery_id).toBe(
        deliveryId
    );

    expect(confirmResponse.body.confirmation.confirmed_by).toBe(1);
    expect(confirmResponse.body.confirmation.method).toBe("code");
});

test("retailer cannot confirm a delivered delivery with an incorrect code", async () => {
    const createResponse = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Wrong Code Test Customer",
            customerPhone: "0712345684",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Wrong Code Test Package"
        });

    expect(createResponse.statusCode).toBe(201);

    const deliveryId = createResponse.body.delivery.id;

    const assignResponse = await request(app)
        .post(`/api/deliveries/${deliveryId}/assign`)
        .set("Authorization", `Bearer ${dispatcherToken}`)
        .send({
            riderId: 4
        });

    expect(assignResponse.statusCode).toBe(200);

    await request(app)
        .patch(`/api/deliveries/${deliveryId}/status`)
        .set("Authorization", `Bearer ${riderToken}`)
        .send({
            status: "Picked Up"
        });

    const deliveredResponse = await request(app)
        .patch(`/api/deliveries/${deliveryId}/status`)
        .set("Authorization", `Bearer ${riderToken}`)
        .send({
            status: "Delivered"
        });

    expect(deliveredResponse.statusCode).toBe(200);

    const confirmResponse = await request(app)
        .post(`/api/deliveries/${deliveryId}/confirm`)
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            confirmationCode: "000000"
        });

    expect(confirmResponse.statusCode).toBe(401);

    expect(confirmResponse.body).toEqual({
        status: "error",
        message: "Invalid confirmation code"
    });
});
test("dispatcher can filter deliveries by status", async () => {
    const response = await request(app)
        .get("/api/deliveries?status=Pending")
        .set("Authorization", `Bearer ${dispatcherToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ok");

    expect(
        response.body.deliveries.every(
            (delivery) => delivery.status === "Pending"
        )
    ).toBe(true);
});

test("dispatcher can filter deliveries by rider", async () => {
    const response = await request(app)
        .get("/api/deliveries?riderId=4")
        .set("Authorization", `Bearer ${dispatcherToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ok");

    expect(
        response.body.deliveries.every(
            (delivery) => delivery.assigned_rider_id === 4
        )
    ).toBe(true);
});

test("dispatcher can filter unassigned deliveries", async () => {
    const response = await request(app)
        .get("/api/deliveries?unassigned=true")
        .set("Authorization", `Bearer ${dispatcherToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ok");

    expect(
        response.body.deliveries.every(
            (delivery) => delivery.assigned_rider_id === null
        )
    ).toBe(true);
});

test("dispatcher can combine delivery filters", async () => {
    const response = await request(app)
        .get("/api/deliveries?status=Assigned&riderId=4")
        .set("Authorization", `Bearer ${dispatcherToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ok");

    expect(
        response.body.deliveries.every(
            (delivery) =>
                delivery.status === "Assigned" &&
                delivery.assigned_rider_id === 4
        )
    ).toBe(true);
});

test("retailer only sees their own deliveries even when filters are supplied", async () => {
    const response = await request(app)
        .get("/api/deliveries?status=Delivered&riderId=4")
        .set("Authorization", `Bearer ${retailerToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ok");

    expect(
        response.body.deliveries.every(
            (delivery) => delivery.created_by === 1
        )
    ).toBe(true);
});

test("rider only sees deliveries assigned to them even when filters are supplied", async () => {
    const response = await request(app)
        .get("/api/deliveries?status=Delivered")
        .set("Authorization", `Bearer ${riderToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ok");

    expect(
        response.body.deliveries.every(
            (delivery) => delivery.assigned_rider_id === 4
        )
    ).toBe(true);
});

test("dispatcher rejects an invalid delivery status filter", async () => {
    const response = await request(app)
        .get("/api/deliveries?status=Banana")
        .set("Authorization", `Bearer ${dispatcherToken}`);

    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual({
        status: "error",
        message: "Invalid delivery status"
    });
});

test("dispatcher rejects a non-numeric delivery ID", async () => {
    const response = await request(app)
        .get("/api/deliveries/abc")
        .set("Authorization", `Bearer ${dispatcherToken}`);

    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual({
        status: "error",
        message: "delivery ID must be a positive integer"
    });
});

test("dispatcher rejects a non-positive delivery ID", async () => {
    const response = await request(app)
        .get("/api/deliveries/-1")
        .set("Authorization", `Bearer ${dispatcherToken}`);

    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual({
        status: "error",
        message: "delivery ID must be a positive integer"
    });
});

test("dispatcher returns 404 for a delivery ID that does not exist", async () => {
    const response = await request(app)
        .get("/api/deliveries/999999")
        .set("Authorization", `Bearer ${dispatcherToken}`);

    expect(response.statusCode).toBe(404);

    expect(response.body).toEqual({
        status: "error",
        message: "Delivery not found"
    });
});

test("rider rejects a non-numeric delivery ID when updating status", async () => {
    const response = await request(app)
        .patch("/api/deliveries/abc/status")
        .set("Authorization", `Bearer ${riderToken}`)
        .send({
            status: "Picked Up"
        });

    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual({
        status: "error",
        message: "delivery ID must be a positive integer"
    });
});

test("dispatcher rejects a non-numeric delivery ID when assigning", async () => {
    const response = await request(app)
        .post("/api/deliveries/abc/assign")
        .set("Authorization", `Bearer ${dispatcherToken}`)
        .send({
            riderId: 4
        });

    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual({
        status: "error",
        message: "delivery ID must be a positive integer"
    });
});

test("user rejects a non-numeric delivery ID when retrieving history", async () => {
    const response = await request(app)
        .get("/api/deliveries/abc/history")
        .set("Authorization", `Bearer ${retailerToken}`);

    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual({
        status: "error",
        message: "delivery ID must be a positive integer"
    });
});

test("retailer rejects a non-numeric delivery ID when cancelling", async () => {
    const response = await request(app)
        .post("/api/deliveries/abc/cancel")
        .set("Authorization", `Bearer ${retailerToken}`);

    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual({
        status: "error",
        message: "delivery ID must be a positive integer"
    });
});


});