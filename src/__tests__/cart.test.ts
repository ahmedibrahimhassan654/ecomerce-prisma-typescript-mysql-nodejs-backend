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

describe("Cart API", () => {
  let adminToken: string;
  let userToken: string;
  let productId: number;
  let cartId: number;
  let cartItemId: number;

  beforeAll(async () => {
    // Create an admin user and get the token
    const adminResult = await createUserAndGetToken("ADMIN");
    adminToken = adminResult.token;

    // Create a regular user and get the token
    const userResult = await createUserAndGetToken("USER");
    userToken = userResult.token;

    // Clear the cart and product tables before running tests
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.product.deleteMany({});

    // Create a product to use in cart tests
    const productResponse = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Test Product",
        description: "This is a test product",
        price: 49.99,
        tags: "test,product",
      })
      .expect(201);

    productId = productResponse.body.data.id;
  });

  afterAll(async () => {
    // Clean up the database
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  it("should add an item to the cart", async () => {
    const response = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        productId,
        quantity: 3,
      })
      .expect(200);

    cartId = response.body.data.id;
    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].productId).toBe(productId);
  });

  it("should get the cart", async () => {
    const response = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(response.body.data).toHaveProperty("id", cartId);
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].productId).toBe(productId);
  });

  it("should get items in the cart by cart ID", async () => {
    const response = await request(app)
      .get(`/api/cart/${cartId}/items`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].productId).toBe(productId);
  });

  it("should delete an item from the cart", async () => {
    // Add an item to the cart first
    const addItemResponse = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        productId,
        quantity: 3,
      })
      .expect(200);

    cartId = addItemResponse.body.data.id;
    cartItemId = addItemResponse.body.data.items[0].id;

    const response = await request(app)
      .delete(`/api/cart/items/${cartItemId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(response.body.message).toBe("Cart item deleted successfully");

    // Verify the item is deleted
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: true },
    });
    expect(cart?.items).toHaveLength(0);
  });

  it("should prevent unauthorized deletion of a cart item", async () => {
    // Create a new cart item with admin user
    const addItemResponse = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        productId,
        quantity: 5,
      })
      .expect(200);

    const testCartItemId = addItemResponse.body.data.items[0].id;

    // Attempt to delete the item with a non-admin token
    const response = await request(app)
      .delete(`/api/cart/items/${testCartItemId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(403);

    expect(response.body.error).toBe("Unauthorized to delete this item");

    // Verify the item still exists
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: testCartItemId },
    });
    expect(cartItem).not.toBeNull();
  });
});
