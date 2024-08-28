import request from "supertest";
import { app } from "../index"; // Adjust the import based on your app setup
import prisma from "../utils/prismaClient";
import jwt from "jsonwebtoken";

// Helper function to create a test user and get token
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

describe("Product API", () => {
  let adminToken: string;
  let userToken: string;
  let productId: number;

  beforeAll(async () => {
    // Create an admin user and get the token
    const adminResult = await createUserAndGetToken("ADMIN");
    adminToken = adminResult.token;

    // Create a regular user and get the token
    const userResult = await createUserAndGetToken("USER");
    userToken = userResult.token;

    // Clear the product table before running tests
    await prisma.product.deleteMany({});
  });

  afterAll(async () => {
    // Clean up the database
    await prisma.product.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  it("should create a product", async () => {
    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "New Product",
        description: "This is a new product",
        price: 19.99,
        tags: "new,product",
      })
      .expect(201);

    // Save the product ID for later tests
    productId = response.body.data.id;

    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data.name).toBe("New Product");
  });

  it("should get a product by ID", async () => {
    const response = await request(app)
      .get(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty("data.id", productId);
    expect(response.body.data.name).toBe("New Product");
  });

  it("should update a product by ID", async () => {
    const response = await request(app)
      .put(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Updated Product",
        description: "This product has been updated",
        price: 29.99,
        tags: "updated,product",
      })
      .expect(200);

    expect(response.body).toHaveProperty("data.id", productId);
    expect(response.body.data.name).toBe("Updated Product");
  });

  it("should delete a product by ID as admin", async () => {
    const response = await request(app)
      .delete(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(204);

    // Verify the product is deleted
    const deletedProduct = await prisma.product.findUnique({
      where: { id: productId },
    });
    expect(deletedProduct).toBeNull();
  });

  it("should prevent non-admin from deleting a product", async () => {
    // Create a new product to test deletion
    const productResponse = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Product for Non-Admin Test",
        description: "This product is for testing non-admin deletion",
        price: 29.99,
        tags: "test,product",
      })
      .expect(201);

    const testProductId = productResponse.body.data.id;

    // Attempt to delete the product with a non-admin token
    const response = await request(app)
      .delete(`/api/products/${testProductId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(403);

    // Ensure the error message matches what your error handler sends

    // Verify that the product still exists
    const productStillExists = await prisma.product.findUnique({
      where: { id: testProductId },
    });
    expect(productStillExists).not.toBeNull();
  });
});
