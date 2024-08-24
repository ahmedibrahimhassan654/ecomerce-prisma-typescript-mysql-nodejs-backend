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
const bcrypt_1 = __importDefault(require("bcrypt"));
const supertest_1 = __importDefault(require("supertest"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = __importDefault(require("../index"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$connect();
    // Create a user for login test with hashed password
    const hashedPassword = yield bcrypt_1.default.hash("password123", 10);
    yield prisma.user.create({
        data: {
            name: "John Doe",
            email: "john.doe@example.com",
            password: hashedPassword, // Store hashed password
            role: "USER",
        },
    });
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.user.deleteMany(); // Clean up the database
    yield prisma.$disconnect();
}));
describe("Auth API", () => {
    it("should sign up a user successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.default)
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
    }));
    it("should fail to sign up a user without a name", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.default)
            .post("/api/auth/signup")
            .send({
            email: `jane.doe${Date.now()}@example.com`, // Use unique email
            password: "password123",
        });
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Required"); // Update to match the actual error message
    }));
    it("should fail to sign up a user with an invalid email", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.default).post("/api/auth/signup").send({
            name: "Jane Doe",
            email: "invalid-email", // Invalid email
            password: "password123",
        });
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Invalid email address");
    }));
    it("should log in a user successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.default).post("/api/auth/login").send({
            email: "john.doe@example.com",
            password: "password123",
        });
        console.log("Login response:", response.body); // Debugging log
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("User logged in successfully");
        expect(response.body.token).toBeDefined(); // Check if token is present in the response
    }));
    it("should fail to log in a user with an invalid email", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.default).post("/api/auth/login").send({
            email: "invalid-email",
            password: "password123",
        });
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Invalid email address");
    }));
    it("should fail to log in a user with incorrect password", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.default).post("/api/auth/login").send({
            email: "john.doe@example.com",
            password: "wrongpassword",
        });
        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Invalid email or password"); // Update to match the actual error message
    }));
});
describe("Me Controller", () => {
    it("should return logged in user information", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield prisma.user.findUnique({
            where: { email: "john.doe@example.com" },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id.toString() }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        const response = yield (0, supertest_1.default)(index_1.default)
            .get("/api/auth/me") // Ensure this matches your route definition
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Logged in user information");
        expect(response.body.data).toMatchObject({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role, // Check the role field
        });
    }));
    it("should return 401 if no token is provided", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.default).get("/api/auth/me"); // Ensure this matches your route definition
        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Unauthorized: No token provided");
    }));
    it("should return 401 if token is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.default)
            .get("/api/auth/me") // Ensure this matches your route definition
            .set("Authorization", "Bearer invalidtoken");
        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Unauthorized: Invalid token");
    }));
});
