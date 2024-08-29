import request from "supertest";
import { app } from "../index"; // Adjust the import based on your app setup
import prisma from "../utils/prismaClient";
import jwt from "jsonwebtoken";

// Helper function to create a test user and get a token
const createUserAndGetToken = async (role: "ADMIN" | "USER") => {
  const user = await prisma.user.create({
    data: {
      name: role === "ADMIN" ? "Admin User" : "Regular User",
      email:
        role === "ADMIN" ? "adminuser@example.com" : "regularuser@example.com",
      password: "testpassword", // Ensure this is hashed in your real implementation
      role: role,
    },
  });

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1h",
    }
  );

  return { token, userId: user.id };
};

describe("Address API", () => {
  let adminToken: string;
  let userToken: string;
  let addressId: number;

  beforeAll(async () => {
    // Create an admin user and get the token
    const adminResult = await createUserAndGetToken("ADMIN");
    adminToken = adminResult.token;

    // Create a regular user and get the token
    const userResult = await createUserAndGetToken("USER");
    userToken = userResult.token;

    // Clear the address table before running tests
    await prisma.address.deleteMany({});
  });

  afterAll(async () => {
    // Clean up the database
    await prisma.address.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  it("should create an address", async () => {
    const response = await request(app)
      .post("/api/users/address")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        line1: "123 Main St",
        line2: "Apt 4",
        city: "New York",
        country: "USA",
        pinCode: "10001",
      })
      .expect(201);

    // Save the address ID for later tests
    addressId = response.body.data.id;

    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data.line1).toBe("123 Main St");
  });

  it("should get an address by ID", async () => {
    const response = await request(app)
      .get(`/api/users/address/${addressId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty("data.id", addressId);
    expect(response.body.data.line1).toBe("123 Main St");
  });

  it("should update an address by ID", async () => {
    const response = await request(app)
      .put(`/api/users/address/${addressId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        line1: "456 Elm St",
        line2: "Apt 8",
        city: "Los Angeles",
        country: "USA",
        pinCode: "90001",
      })
      .expect(200);

    expect(response.body).toHaveProperty("data.id", addressId);
    expect(response.body.data.line1).toBe("456 Elm St");
  });

  it("should delete an address by ID as admin", async () => {
    const response = await request(app)
      .delete(`/api/users/address/${addressId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    // Verify the address is deleted
    const deletedAddress = await prisma.address.findUnique({
      where: { id: addressId },
    });
    expect(deletedAddress).toBeNull();
  });

  it("should prevent non-admin from deleting an address", async () => {
    // Create a new address to test deletion
    const addressResponse = await request(app)
      .post("/api/users/address")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        line1: "789 Pine St",
        line2: "Apt 12",
        city: "San Francisco",
        country: "USA",
        pinCode: "94101",
      })
      .expect(201);

    const testAddressId = addressResponse.body.data.id;

    // Attempt to delete the address with a non-admin token
    const response = await request(app)
      .delete(`/api/users/address/${testAddressId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(403);

    // // Ensure the error message matches what your error handler sends
    // expect(response.body).toHaveProperty(
    //   "error",
    //   "Not authorized to delete this address"
    // );

    // Verify that the address still exists
    const addressStillExists = await prisma.address.findUnique({
      where: { id: testAddressId },
    });
    expect(addressStillExists).not.toBeNull();
  });

  it("should get all addresses for the authenticated user", async () => {
    const response = await request(app)
      .get("/api/users/my-addresses")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(response.body).toHaveProperty("data");
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
