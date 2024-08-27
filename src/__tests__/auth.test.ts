import dotenv from "dotenv";
dotenv.config({ path: `.env.test` });
import prisma from "../utils/prismaClient";
import bcrypt from "bcrypt";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app, server } from "../index";
import { execSync } from "child_process";

beforeAll(async () => {
  try {
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
        name: "John Doe",
        email: "john.doe@example.com",
        password: hashedPassword,
        role: "USER",
      },
    });
    console.log("Test user created successfully.");
  } catch (error) {
    console.error("Error during setup:", error);
    throw error;
  }
}, 30000); // Increase timeout to 30 seconds

afterAll(async () => {
  console.log("Cleaning up the database...");
  await prisma.user.deleteMany();
  await prisma.$disconnect();
  await new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) return reject(err);
      console.log("Server closed");
      resolve();
    });
  });
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

  beforeAll(async () => {
    // Create a test user and generate a JWT token for the test user
    const testUser = await prisma.user.findFirst({
      where: { email: "john.doe@example.com" },
    });

    testUserToken = jwt.sign(
      { id: testUser!.id, email: testUser!.email },
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
  });

  it("should return 401 if no token is provided", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("No token provided");
  });
});
