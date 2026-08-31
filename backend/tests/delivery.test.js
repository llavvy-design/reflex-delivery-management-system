const request = require("supertest");

const app = require("../src/server");

describe("Delivery lifecycle", () => {
    let retailerToken;
    let dispatcherToken;
    let riderToken;
    let secondRetailerToken;

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

               const secondRetailerEmail =
            `ownership-test-${Date.now()}@example.com`;

        const secondRetailerRegistration = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Ownership Test Retailer",
                email: secondRetailerEmail,
                phone: "0712345699",
                password: "TestPassword123"
            });

        expect(secondRetailerRegistration.statusCode).toBe(201);

        const secondRetailerLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: secondRetailerEmail,
                password: "TestPassword123"
            });

        expect(secondRetailerLogin.statusCode).toBe(200);

        secondRetailerToken = secondRetailerLogin.body.token;

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

    test("retailer cannot create a delivery with a missing customer name", async () => {
    const response = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerPhone: "0712345678",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Validation Test Package"
        });

    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual({
        status: "error",
        message: "customerName is required"
    });
});

test("retailer cannot create a delivery with a missing customer phone", async () => {
    const response = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Validation Test Customer",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Validation Test Package"
        });

    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual({
        status: "error",
        message: "customerPhone is required"
    });
});

test("retailer cannot create a delivery with a missing address", async () => {
    const response = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Validation Test Customer",
            customerPhone: "0712345678",
            itemDescription: "Validation Test Package"
        });

    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual({
        status: "error",
        message: "deliveryAddress is required"
    });
});

test("retailer cannot create a delivery with a missing item description", async () => {
    const response = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Validation Test Customer",
            customerPhone: "0712345678",
            deliveryAddress: "Mombasa CBD"
        });

    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual({
        status: "error",
        message: "itemDescription is required"
    });
});

test("retailer cannot create a delivery with a customer name longer than 100 characters", async () => {
    const response = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "A".repeat(101),
            customerPhone: "0712345678",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Validation Test Package"
        });

    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual({
        status: "error",
        message: "Customer name must not exceed 100 characters"
    });
});

test("retailer cannot create a delivery with a customer phone longer than 20 characters", async () => {
    const response = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Validation Test Customer",
            customerPhone: "1".repeat(21),
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Validation Test Package"
        });

    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual({
        status: "error",
        message: "Customer phone must not exceed 20 characters"
    });
});

test("retailer cannot create a delivery with an address longer than 5000 characters", async () => {
    const response = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Validation Test Customer",
            customerPhone: "0712345678",
            deliveryAddress: "A".repeat(5001),
            itemDescription: "Validation Test Package"
        });

    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual({
        status: "error",
        message: "Delivery address is too long"
    });
});

test("retailer cannot create a delivery with an item description longer than 5000 characters", async () => {
    const response = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Validation Test Customer",
            customerPhone: "0712345678",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "A".repeat(5001)
        });

    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual({
        status: "error",
        message: "Item description is too long"
    });
});

    test("retailer can edit their own pending delivery", async () => {
    const createResponse = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Edit Test Customer",
            customerPhone: "0712345710",
            deliveryAddress: "Original Address",
            itemDescription: "Original Item"
        });

    expect(createResponse.statusCode).toBe(201);

    const deliveryId = createResponse.body.delivery.id;

    const updateResponse = await request(app)
        .patch(`/api/deliveries/${deliveryId}`)
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Updated Customer",
            customerPhone: "0712345711",
            deliveryAddress: "Updated Address",
            itemDescription: "Updated Item"
        });

    expect(updateResponse.statusCode).toBe(200);

    expect(updateResponse.body).toMatchObject({
        status: "ok",
        message: "Delivery updated successfully"
    });

    expect(updateResponse.body.delivery).toMatchObject({
        id: deliveryId,
        customer_name: "Updated Customer",
        customer_phone: "0712345711",
        delivery_address: "Updated Address",
        item_description: "Updated Item",
        status: "Pending"
    });
});

test("retailer cannot edit a delivery after it has been assigned", async () => {
    const createResponse = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Assigned Edit Customer",
            customerPhone: "0712345712",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Assigned Edit Package"
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

    const updateResponse = await request(app)
        .patch(`/api/deliveries/${deliveryId}`)
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Should Not Update",
            customerPhone: "0712345713",
            deliveryAddress: "Should Not Update",
            itemDescription: "Should Not Update"
        });

    expect(updateResponse.statusCode).toBe(404);

    expect(updateResponse.body).toEqual({
        status: "error",
        message: "Delivery not found or cannot be edited"
    });
});

test("dispatcher cannot edit a delivery", async () => {
    const createResponse = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Dispatcher Edit Customer",
            customerPhone: "0712345714",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Dispatcher Edit Package"
        });

    expect(createResponse.statusCode).toBe(201);

    const deliveryId = createResponse.body.delivery.id;

    const response = await request(app)
        .patch(`/api/deliveries/${deliveryId}`)
        .set("Authorization", `Bearer ${dispatcherToken}`)
        .send({
            customerName: "Unauthorized",
            customerPhone: "0712345715",
            deliveryAddress: "Unauthorized",
            itemDescription: "Unauthorized"
        });

    expect(response.statusCode).toBe(403);

    expect(response.body).toEqual({
        status: "error",
        message: "Only retailers can edit deliveries"
    });
});

test("rider cannot edit a delivery", async () => {
    const createResponse = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Rider Edit Customer",
            customerPhone: "0712345716",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Rider Edit Package"
        });

    expect(createResponse.statusCode).toBe(201);

    const deliveryId = createResponse.body.delivery.id;

    const response = await request(app)
        .patch(`/api/deliveries/${deliveryId}`)
        .set("Authorization", `Bearer ${riderToken}`)
        .send({
            customerName: "Unauthorized",
            customerPhone: "0712345717",
            deliveryAddress: "Unauthorized",
            itemDescription: "Unauthorized"
        });

    expect(response.statusCode).toBe(403);

    expect(response.body).toEqual({
        status: "error",
        message: "Only retailers can edit deliveries"
    });
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

test("retailer cannot view another retailer's delivery", async () => {
    const createResponse = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${secondRetailerToken}`)
        .send({
            customerName: "Ownership Customer",
            customerPhone: "0712345700",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Ownership Test Package"
        });

    expect(createResponse.statusCode).toBe(201);

    const deliveryId = createResponse.body.delivery.id;

    const response = await request(app)
        .get(`/api/deliveries/${deliveryId}`)
        .set("Authorization", `Bearer ${retailerToken}`);

    expect(response.statusCode).toBe(404);

    expect(response.body).toEqual({
        status: "error",
        message: "Delivery not found"
    });
});

test("retailer cannot edit another retailer's delivery", async () => {
    const createResponse = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${secondRetailerToken}`)
        .send({
            customerName: "Edit Ownership Customer",
            customerPhone: "0712345701",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Edit Ownership Test Package"
        });

    expect(createResponse.statusCode).toBe(201);

    const deliveryId = createResponse.body.delivery.id;

    const response = await request(app)
        .patch(`/api/deliveries/${deliveryId}`)
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Unauthorized Edit",
            customerPhone: "0712345702",
            deliveryAddress: "Unauthorized Address",
            itemDescription: "Unauthorized Edit"
        });

    expect(response.statusCode).toBe(404);

    expect(response.body).toEqual({
        status: "error",
        message: "Delivery not found or cannot be edited"
    });
});
test("retailer cannot cancel another retailer's delivery", async () => {
    const createResponse = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${secondRetailerToken}`)
        .send({
            customerName: "Cancel Ownership Customer",
            customerPhone: "0712345703",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Cancel Ownership Test Package"
        });

    expect(createResponse.statusCode).toBe(201);

    const deliveryId = createResponse.body.delivery.id;

    const response = await request(app)
        .post(`/api/deliveries/${deliveryId}/cancel`)
        .set("Authorization", `Bearer ${retailerToken}`);

    expect(response.statusCode).toBe(403);

    expect(response.body).toEqual({
        status: "error",
        message: "You are not authorized to cancel this delivery"
    });
});

test("retailer cannot confirm another retailer's delivered delivery", async () => {
    const createResponse = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${secondRetailerToken}`)
        .send({
            customerName: "Confirm Ownership Customer",
            customerPhone: "0712345704",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Confirm Ownership Test Package"
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

    const response = await request(app)
        .post(`/api/deliveries/${deliveryId}/confirm`)
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            confirmationCode
        });

    expect(response.statusCode).toBe(403);

    expect(response.body).toEqual({
        status: "error",
        message: "You are not authorized to confirm this delivery"
    });
});

test("retailer can cancel their own pending delivery", async () => {
    const createResponse = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Cancel Test Customer",
            customerPhone: "0712345718",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Cancel Test Package"
        });

    expect(createResponse.statusCode).toBe(201);

    const deliveryId = createResponse.body.delivery.id;

    const response = await request(app)
        .post(`/api/deliveries/${deliveryId}/cancel`)
        .set("Authorization", `Bearer ${retailerToken}`);

    expect(response.statusCode).toBe(200);

    expect(response.body).toMatchObject({
        status: "ok",
        message: "Delivery cancelled successfully"
    });

    expect(response.body.delivery).toMatchObject({
        id: deliveryId,
        status: "Cancelled"
    });
});

test("dispatcher can cancel a pending delivery", async () => {
    const createResponse = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Dispatcher Cancel Customer",
            customerPhone: "0712345719",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Dispatcher Cancel Package"
        });

    expect(createResponse.statusCode).toBe(201);

    const deliveryId = createResponse.body.delivery.id;

    const response = await request(app)
        .post(`/api/deliveries/${deliveryId}/cancel`)
        .set("Authorization", `Bearer ${dispatcherToken}`);

    expect(response.statusCode).toBe(200);

    expect(response.body).toMatchObject({
        status: "ok",
        message: "Delivery cancelled successfully"
    });

    expect(response.body.delivery.status).toBe("Cancelled");
});

test("rider cannot cancel a delivery", async () => {
    const createResponse = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Rider Cancel Customer",
            customerPhone: "0712345720",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Rider Cancel Package"
        });

    expect(createResponse.statusCode).toBe(201);

    const deliveryId = createResponse.body.delivery.id;

    const response = await request(app)
        .post(`/api/deliveries/${deliveryId}/cancel`)
        .set("Authorization", `Bearer ${riderToken}`);

    expect(response.statusCode).toBe(403);

    expect(response.body).toEqual({
        status: "error",
        message: "Only retailers or dispatchers can cancel deliveries"
    });
});

test("delivered delivery cannot be cancelled", async () => {
    const createResponse = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Delivered Cancel Customer",
            customerPhone: "0712345721",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Delivered Cancel Package"
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

    const response = await request(app)
        .post(`/api/deliveries/${deliveryId}/cancel`)
        .set("Authorization", `Bearer ${retailerToken}`);

    expect(response.statusCode).toBe(409);

    expect(response.body).toEqual({
        status: "error",
        message: "Delivery cannot be cancelled from Delivered status"
    });
});

test("picked up delivery cannot be cancelled", async () => {
    const createResponse = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Picked Up Cancel Customer",
            customerPhone: "0712345722",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Picked Up Cancel Package"
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

    const pickedUpResponse = await request(app)
        .patch(`/api/deliveries/${deliveryId}/status`)
        .set("Authorization", `Bearer ${riderToken}`)
        .send({
            status: "Picked Up"
        });

    expect(pickedUpResponse.statusCode).toBe(200);

    const response = await request(app)
        .post(`/api/deliveries/${deliveryId}/cancel`)
        .set("Authorization", `Bearer ${retailerToken}`);

    expect(response.statusCode).toBe(409);

    expect(response.body).toEqual({
        status: "error",
        message: "Delivery cannot be cancelled from Picked Up status"
    });
});

test("cancelled delivery cannot be cancelled again", async () => {
    const createResponse = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Double Cancel Customer",
            customerPhone: "0712345723",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Double Cancel Package"
        });

    expect(createResponse.statusCode).toBe(201);

    const deliveryId = createResponse.body.delivery.id;

    const firstResponse = await request(app)
        .post(`/api/deliveries/${deliveryId}/cancel`)
        .set("Authorization", `Bearer ${retailerToken}`);

    expect(firstResponse.statusCode).toBe(200);

    const secondResponse = await request(app)
        .post(`/api/deliveries/${deliveryId}/cancel`)
        .set("Authorization", `Bearer ${retailerToken}`);

    expect(secondResponse.statusCode).toBe(409);

    expect(secondResponse.body).toEqual({
        status: "error",
        message: "Delivery cannot be cancelled from Cancelled status"
    });
});

test("retailer can retrieve their delivery confirmation", async () => {
    const createResponse = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Get Confirmation Customer",
            customerPhone: "0712345724",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Get Confirmation Package"
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

    const response = await request(app)
        .get(`/api/deliveries/${deliveryId}/confirmation`)
        .set("Authorization", `Bearer ${retailerToken}`);

    expect(response.statusCode).toBe(200);

    expect(response.body).toMatchObject({
        status: "ok",
        message: "Delivery confirmation retrieved successfully"
    });

    expect(response.body.confirmation).toMatchObject({
        delivery_id: deliveryId,
        confirmed_by: 1,
        method: "code"
    });

    expect(response.body.confirmation.confirmed_at).toBeDefined();
});

test("dispatcher cannot retrieve delivery confirmation", async () => {
    const createResponse = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Dispatcher Confirmation Customer",
            customerPhone: "0712345725",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Dispatcher Confirmation Package"
        });

    expect(createResponse.statusCode).toBe(201);

    const deliveryId = createResponse.body.delivery.id;

    const response = await request(app)
        .get(`/api/deliveries/${deliveryId}/confirmation`)
        .set("Authorization", `Bearer ${dispatcherToken}`);

    expect(response.statusCode).toBe(403);

    expect(response.body).toEqual({
        status: "error",
        message: "Only retailers can view delivery confirmation"
    });
});

test("rider cannot retrieve delivery confirmation", async () => {
    const createResponse = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Rider Confirmation Customer",
            customerPhone: "0712345726",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Rider Confirmation Package"
        });

    expect(createResponse.statusCode).toBe(201);

    const deliveryId = createResponse.body.delivery.id;

    const response = await request(app)
        .get(`/api/deliveries/${deliveryId}/confirmation`)
        .set("Authorization", `Bearer ${riderToken}`);

    expect(response.statusCode).toBe(403);

    expect(response.body).toEqual({
        status: "error",
        message: "Only retailers can view delivery confirmation"
    });
});  

test("retailer gets 404 when delivery has no confirmation", async () => {
    const createResponse = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "No Confirmation Customer",
            customerPhone: "0712345727",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "No Confirmation Package"
        });

    expect(createResponse.statusCode).toBe(201);

    const deliveryId = createResponse.body.delivery.id;

    const response = await request(app)
        .get(`/api/deliveries/${deliveryId}/confirmation`)
        .set("Authorization", `Bearer ${retailerToken}`);

    expect(response.statusCode).toBe(404);

    expect(response.body).toEqual({
        status: "error",
        message: "Delivery confirmation not found"
    });
});


});