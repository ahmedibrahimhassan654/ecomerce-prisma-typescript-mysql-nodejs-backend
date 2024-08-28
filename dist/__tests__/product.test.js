"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index");
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken")); // Import jwt if not already done
// Mock the Prisma product.create function
describe("POST /api/products", () => {
    let adminToken;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Generate a JWT token for the admin user
        const admin = yield prismaClient_1.default.user.findFirst({
            where: { email: "admin@example.com" },
        });
        if (admin) {
            adminToken = jsonwebtoken_1.default.sign({ id: admin.id, email: admin.email, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        }
    }));
    it("should create a new product successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const productData = {
            name: "Test Product",
            description: "Test Description",
            price: 99.99,
            tags: "test,product",
        };
        // Mock the Prisma product.create function
        jest.spyOn(prismaClient_1.default.product, "create").mockResolvedValue(Object.assign(Object.assign({ id: 1 }, productData), { createdAt: new Date(), updatedAt: new Date() }));
        const response = yield (0, supertest_1.default)(index_1.app)
            .post("/api/products")
            .send(productData)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toMatchObject(productData);
    }));
    it("should return 401 if name or price is missing", () => __awaiter(void 0, void 0, void 0, function* () {
        const productData = {
            description: "Test Description",
            tags: "test,product",
        };
        const response = yield (0, supertest_1.default)(index_1.app)
            .post("/api/products")
            .send(productData)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Name and price are required");
    }));
    it("should handle internal server error", () => __awaiter(void 0, void 0, void 0, function* () {
        // Mock an internal server error during product creation
        prismaClient_1.default.product.create.mockRejectedValue(new Error("Internal server error"));
        const productData = {
            name: "Test Product",
            description: "Test Description",
            price: 99.99,
            tags: "test,product",
        };
        const response = yield (0, supertest_1.default)(index_1.app)
            .post("/api/products")
            .send(productData)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(response.status).toBe(500); // Corrected status code
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Internal server error");
    }));
    it("should return 401 if no token is provided", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.app).post("/api/products").send({
            name: "Test Product",
            description: "Test Description",
            price: 99.99,
            tags: "test,product",
        });
        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("No token provided");
    }));
    it("should return 403 if user is not an admin", () => __awaiter(void 0, void 0, void 0, function* () {
        const userToken = jsonwebtoken_1.default.sign({ id: 123, email: "user@example.com", role: "USER" }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const response = yield (0, supertest_1.default)(index_1.app)
            .post("/api/products")
            .send({
            name: "Test Product",
            description: "Test Description",
            price: 99.99,
            tags: "test,product",
        })
            .set("Authorization", `Bearer ${userToken}`);
        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Access denied");
    }));
});
