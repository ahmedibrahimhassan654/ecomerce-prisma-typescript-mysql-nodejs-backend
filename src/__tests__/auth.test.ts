import dotenv from "dotenv";
dotenv.config({ path: `.env.test` });
import prisma from "../utils/prismaClient";
import bcrypt from "bcrypt";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../index";
import { execSync } from "child_process";

beforeAll(async () => {
  console.log("Running migrations...");
  const output = execSync("npm run prisma:migrate:test", {
    stdio: "pipe",
  }).toString();
  console.log("Migration output:", output);
  console.log("Migrations completed successfully.");

  console.log("Connecting to the database...");
  await prisma.$connect();
  console.log("Database connected successfully.");

  console.log("Creating test user...");
  const hashedPassword = await bcrypt.hash("password123", 10);
  await prisma.user.create({
    data: {
      name: "John Doe", // Ensure 'name' is provided
      email: "john.doe@example.com",
      password: hashedPassword,
      role: "USER", // or "ADMIN" depending on your roles
    },
  });
  console.log("Test user created successfully.");
}, 30000);

afterAll(async () => {
  console.log("Cleaning up the database...");
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

afterEach(() => {
  jest.clearAllTimers();
});

describe("Auth API", () => {
  it("should sign up a user successfully", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Jane Doe",
        email: `jane.doe${Date.now()}@example.com`, // Use unique email
        password: "password123",
        role: "ADMIN",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("User signed up successfully");
  });

  it("should fail to sign up a user without a name", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        email: `jane.doe${Date.now()}@example.com`, // Use unique email
        password: "password123",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Required"); // Update to match the actual error message
  });

  it("should fail to sign up a user with an invalid email", async () => {
    const response = await request(app).post("/api/auth/signup").send({
      name: "Jane Doe",
      email: "invalid-email", // Invalid email
      password: "password123",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid email address");
  });

  it("should log in a user successfully", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "john.doe@example.com",
      password: "password123",
    });

    console.log("Login response:", response.body); // Debugging log

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("User logged in successfully");
    expect(response.body.token).toBeDefined(); // Check if token is present in the response
  });

  it("should fail to log in a user with an invalid email", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "invalid-email",
      password: "password123",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid email address");
  });

  it("should fail to log in a user with incorrect password", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "john.doe@example.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid email or password"); // Update to match the actual error message
  });
});

describe("GET /api/auth/me", () => {
  let testUserToken: string;
  let testUserId: number;

  beforeAll(async () => {
    // Create a test user if not exists
    let testUser = await prisma.user.findFirst({
      where: { email: "john.doe@example.com" },
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          name: "John Doe",
          email: "john.doe@example.com",
          password: await bcrypt.hash("testpassword", 10), // Hash the password
          role: "USER", // or "ADMIN" depending on your roles
        },
      });
    }

    testUserId = testUser.id;

    // Generate a JWT token for the test user with the correct payload
    testUserToken = jwt.sign(
      { userId: testUserId }, // Note: The key must match what authenticate expects
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
  });

  it("should return the logged-in user's information", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${testUserToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Logged in user information");
    expect(response.body.data).toBeDefined();
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe("john.doe@example.com");
    expect(response.body.user.id).toBe(testUserId);
  });

  it("should return 401 if no token is provided", async () => {
    const response = await request(app).get("/api/auth/me");

    console.log("Response body when no token is provided:", response.body); // Log the response body

    expect(response.status).toBe(401);
    // Adjust the expectation based on the actual response structure
    expect(response.body.message).toBe("Unauthorized");
  });
});
