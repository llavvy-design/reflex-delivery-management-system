const request = require("supertest");
const { io: ioClient } = require("socket.io-client");
const bcrypt = require("bcrypt");

const pool = require("../src/config/database");

const app = require("../src/server");
const { httpServer, io } = require("../src/server");

describe("Socket.IO authentication", () => {
    let retailerToken;
    let dispatcherToken;
    let riderToken;
    let secondRetailerToken;
    let secondRiderToken;

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

        expect(retailerLogin.statusCode).toBe(200);
        expect(dispatcherLogin.statusCode).toBe(200);
        expect(riderLogin.statusCode).toBe(200);

        retailerToken = retailerLogin.body.token;
        dispatcherToken = dispatcherLogin.body.token;
        riderToken = riderLogin.body.token;
        
        const secondRetailerEmail =
            `socket-test-${Date.now()}@example.com`;

        const secondRetailerRegistration = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Socket Test Retailer",
                email: secondRetailerEmail,
                phone: "0712345729",
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

        const secondRiderEmail =
            `socket-rider-test-${Date.now()}@example.com`;

        const secondRiderPassword = "TestPassword123";

        const secondRiderPasswordHash = await bcrypt.hash(
            secondRiderPassword,
            12
        );

        const secondRiderResult = await pool.query(
            `INSERT INTO users
                (name, email, phone, password_hash, role)
             VALUES
                ($1, $2, $3, $4, $5)
             RETURNING id, name, email, phone, role`,
            [
                "Socket Test Rider",
                secondRiderEmail,
                "0712345733",
                secondRiderPasswordHash,
                "rider"
            ]
        );

        expect(secondRiderResult.rows[0].role).toBe("rider");

        const secondRiderLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: secondRiderEmail,
                password: secondRiderPassword
            });

        expect(secondRiderLogin.statusCode).toBe(200);

        secondRiderToken = secondRiderLogin.body.token;

        await new Promise((resolve, reject) => {
            httpServer.listen(0, resolve);
            httpServer.on("error", reject);
        });
    });

    afterAll(async () => {
        io.close();

        await new Promise((resolve, reject) => {
            httpServer.close((error) => {
                 if (error) {
                    reject(error);
                    return;
                }

                 resolve();
            });
        });
    });

    test("authenticated retailer can connect", async () => {
        const port = httpServer.address().port;

        const socket = ioClient(
            `http://localhost:${port}`,
            {
                auth: {
                    token: retailerToken
                },
                transports: ["websocket"]
            }
        );

        await new Promise((resolve, reject) => {
            socket.on("connect", resolve);

            socket.on("connect_error", reject);
        });

        expect(socket.connected).toBe(true);

        socket.disconnect();
    });

    test("connection without a token is rejected", async () => {
        const port = httpServer.address().port;

        const socket = ioClient(
            `http://localhost:${port}`,
            {
                transports: ["websocket"]
            }
        );

        const error = await new Promise((resolve) => {
            socket.on("connect_error", resolve);
        });

        expect(error.message).toBe(
            "Authentication token is required"
        );

        socket.disconnect();
    });

    test("connection with an invalid token is rejected", async () => {
        const port = httpServer.address().port;

        const socket = ioClient(
            `http://localhost:${port}`,
            {
                auth: {
                    token: "invalid-token"
                },
                transports: ["websocket"]
            }
        );

        const error = await new Promise((resolve) => {
            socket.on("connect_error", resolve);
        });

        expect(error.message).toBe(
            "Invalid or expired authentication token"
        );

        socket.disconnect();
    });

    test("retailer receives their own delivery:created event", async () => {
        const port = httpServer.address().port;

        const socket = ioClient(
           `http://localhost:${port}`,
            {
                auth: {
                token: retailerToken
                },
            transports: ["websocket"]
        }
    );

    await new Promise((resolve, reject) => {
        socket.on("connect", resolve);
        socket.on("connect_error", reject);
    });

    const deliveryEvent = new Promise((resolve, reject) => {
        socket.once("delivery:created", resolve);

        setTimeout(() => {
            reject(
                new Error(
                    "Timed out waiting for delivery:created event"
                )
            );
        }, 5000);
    });

    const response = await request(app)
        .post("/api/deliveries")
        .set("Authorization", `Bearer ${retailerToken}`)
        .send({
            customerName: "Socket Test Customer",
            customerPhone: "0712345728",
            deliveryAddress: "Mombasa CBD",
            itemDescription: "Socket Test Package"
        });

    expect(response.statusCode).toBe(201);

    const payload = await deliveryEvent;

    expect(payload.delivery).toMatchObject({
        id: response.body.delivery.id,
        created_by: 1,
        customer_name: "Socket Test Customer",
        status: "Pending"
    });

    socket.disconnect();
});

    test("retailer does not receive another retailer's delivery:created event", async () => {
        const port = httpServer.address().port;

        const socket = ioClient(
            `http://localhost:${port}`,
            {
                auth: {
                    token: secondRetailerToken
                },
                transports: ["websocket"]
            }
        );

        await new Promise((resolve, reject) => {
            socket.on("connect", resolve);
            socket.on("connect_error", reject);
        });

        const unexpectedEvent = new Promise((resolve) => {
            socket.once("delivery:created", resolve);

            setTimeout(() => {
                resolve(null);
            }, 1500);
        });

        const response = await request(app)
            .post("/api/deliveries")
            .set("Authorization", `Bearer ${retailerToken}`)
            .send({
                customerName: "Isolation Test Customer",
                customerPhone: "0712345730",
                deliveryAddress: "Mombasa CBD",
                itemDescription: "Isolation Test Package"
            });

        expect(response.statusCode).toBe(201);

        const payload = await unexpectedEvent;

        expect(payload).toBeNull();

        socket.disconnect();
    });

        test("dispatcher receives delivery:created events", async () => {
        const port = httpServer.address().port;

        const socket = ioClient(
            `http://localhost:${port}`,
            {
                auth: {
                    token: dispatcherToken
                },
                transports: ["websocket"]
            }
        );

        await new Promise((resolve, reject) => {
            socket.on("connect", resolve);
            socket.on("connect_error", reject);
        });

        const deliveryEvent = new Promise((resolve, reject) => {
            socket.once("delivery:created", resolve);

            setTimeout(() => {
                reject(
                    new Error(
                        "Timed out waiting for delivery:created event"
                    )
                );
            }, 5000);
        });

        const response = await request(app)
            .post("/api/deliveries")
            .set("Authorization", `Bearer ${retailerToken}`)
            .send({
                customerName: "Dispatcher Socket Test Customer",
                customerPhone: "0712345731",
                deliveryAddress: "Mombasa CBD",
                itemDescription: "Dispatcher Socket Test Package"
            });

        expect(response.statusCode).toBe(201);

        const payload = await deliveryEvent;

        expect(payload.delivery).toMatchObject({
            id: response.body.delivery.id,
            created_by: 1,
            status: "Pending"
        });

        socket.disconnect();
    });

        test("only the assigned rider receives delivery:assigned", async () => {
        const port = httpServer.address().port;

        const assignedRiderSocket = ioClient(
            `http://localhost:${port}`,
            {
                auth: {
                    token: riderToken
                },
                transports: ["websocket"]
            }
        );

        const otherRiderSocket = ioClient(
            `http://localhost:${port}`,
            {
                auth: {
                    token: secondRiderToken
                },
                transports: ["websocket"]
            }
        );

        await Promise.all([
            new Promise((resolve, reject) => {
                assignedRiderSocket.on("connect", resolve);
                assignedRiderSocket.on("connect_error", reject);
            }),
            new Promise((resolve, reject) => {
                otherRiderSocket.on("connect", resolve);
                otherRiderSocket.on("connect_error", reject);
            })
        ]);

        const assignedEvent = new Promise((resolve, reject) => {
            assignedRiderSocket.once(
                "delivery:assigned",
                resolve
            );

            setTimeout(() => {
                reject(
                    new Error(
                        "Timed out waiting for delivery:assigned event"
                    )
                );
            }, 5000);
        });

        const unexpectedEvent = new Promise((resolve) => {
            otherRiderSocket.once(
                "delivery:assigned",
                resolve
            );

            setTimeout(() => {
                resolve(null);
            }, 1500);
        });

        const createResponse = await request(app)
            .post("/api/deliveries")
            .set("Authorization", `Bearer ${retailerToken}`)
            .send({
                customerName: "Rider Isolation Customer",
                customerPhone: "0712345734",
                deliveryAddress: "Mombasa CBD",
                itemDescription: "Rider Isolation Package"
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

        const assignedPayload = await assignedEvent;
        const otherPayload = await unexpectedEvent;

        expect(assignedPayload.delivery).toMatchObject({
            id: deliveryId,
            assigned_rider_id: 4,
            status: "Assigned"
        });

        expect(otherPayload).toBeNull();

        assignedRiderSocket.disconnect();
        otherRiderSocket.disconnect();
    });
});