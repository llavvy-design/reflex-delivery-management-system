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

        test("authenticated user can retrieve their full current user profile", async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: "test@example.com",
                password: "TestPassword123"
            });

        expect(loginResponse.statusCode).toBe(200);
        expect(loginResponse.body.token).toBeDefined();

        const response = await request(app)
            .get("/api/auth/me")
            .set(
                "Authorization",
                `Bearer ${loginResponse.body.token}`
            );

        expect(response.statusCode).toBe(200);

        expect(response.body).toMatchObject({
            status: "ok",
            message: "Authentication verified"
        });

        expect(response.body.user).toMatchObject({
            id: 1,
            name: "Test Retailer",
            email: "test@example.com",
            phone: "0712345678",
            role: "retailer"
        });

        expect(response.body.user).not.toHaveProperty(
            "password"
        );

        expect(response.body.user).not.toHaveProperty(
            "password_hash"
        );

        expect(response.body.user).not.toHaveProperty(
            "userId"
        );

        expect(response.body.user).not.toHaveProperty(
            "iat"
        );

        expect(response.body.user).not.toHaveProperty(
            "exp"
        );
    });

    describe("User registration", () => {
    test("registration should reject missing name", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                email: `missing-name-${Date.now()}@example.com`,
                phone: "0712345678",
                password: "TestPassword123"
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            status: "error",
            message: "name is required"
        });
    });

    test("registration should reject missing email", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Validation Test User",
                phone: "0712345678",
                password: "TestPassword123"
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            status: "error",
            message: "email is required"
        });
    });

    test("registration should reject an invalid email", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Validation Test User",
                email: "not-an-email",
                phone: "0712345678",
                password: "TestPassword123"
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            status: "error",
            message: "email must be valid"
        });
    });

    test("registration should reject missing phone", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Validation Test User",
                email: `missing-phone-${Date.now()}@example.com`,
                password: "TestPassword123"
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            status: "error",
            message: "phone is required"
        });
    });

    test("registration should reject missing password", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Validation Test User",
                email: `missing-password-${Date.now()}@example.com`,
                phone: "0712345678"
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            status: "error",
            message: "password is required"
        });
    });

    test("registration should reject a password shorter than 8 characters", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Validation Test User",
                email: `short-password-${Date.now()}@example.com`,
                phone: "0712345678",
                password: "1234567"
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            status: "error",
            message: "password must be at least 8 characters"
        });
    });

    test("registration should create a valid retailer account", async () => {
        const email = `valid-${Date.now()}@example.com`;

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Validation Test User",
                email,
                phone: "0712345678",
                password: "TestPassword123"
            });

        expect(response.statusCode).toBe(201);

        expect(response.body.status).toBe("ok");
        expect(response.body.message).toBe("User registered successfully");
        expect(response.body.user.email).toBe(email);
        expect(response.body.user.role).toBe("retailer");
        expect(response.body.user).not.toHaveProperty("password");
        expect(response.body.user).not.toHaveProperty("password_hash");
    });

    test("registration should reject a duplicate email", async () => {
    const email = `duplicate-${Date.now()}@example.com`;

    const firstResponse = await request(app)
        .post("/api/auth/register")
        .send({
            name: "Duplicate Test User",
            email,
            phone: "0712345678",
            password: "TestPassword123"
        });

    expect(firstResponse.statusCode).toBe(201);

    const secondResponse = await request(app)
        .post("/api/auth/register")
        .send({
            name: "Duplicate Test User",
            email,
            phone: "0712345678",
            password: "TestPassword123"
        });

    expect(secondResponse.statusCode).toBe(409);

    expect(secondResponse.body).toEqual({
        status: "error",
        message: "Email is already registered"
    });
    });

});

});