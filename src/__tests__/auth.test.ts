import bcrypt from "bcrypt";
import request from "supertest";
import app from "../index";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
  // Create a user for login test with hashed password
  const hashedPassword = await bcrypt.hash("password123", 10);
  await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john.doe@example.com",
      password: hashedPassword, // Store hashed password
    },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany(); // Clean up the database
  await prisma.$disconnect();
});

describe("Auth API", () => {
  it("should sign up a user successfully", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Jane Doe",
        email: `jane.doe${Date.now()}@example.com`, // Use unique email
        password: "password123",
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
