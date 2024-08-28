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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: `.env.test` });
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const supertest_1 = __importDefault(require("supertest"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../index");
const child_process_1 = require("child_process");
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Running migrations...");
        const output = (0, child_process_1.execSync)("npm run prisma:migrate:test", {
            stdio: "pipe",
        }).toString();
        console.log("Migration output:", output);
        console.log("Migrations completed successfully.");
        console.log("Connecting to the database...");
        yield prismaClient_1.default.$connect();
        console.log("Database connected successfully.");
        console.log("Creating test user...");
        const hashedPassword = yield bcrypt_1.default.hash("password123", 10);
        yield prismaClient_1.default.user.create({
            data: {
                name: "John Doe",
                email: "john.doe@example.com",
                password: hashedPassword,
                role: "USER",
            },
        });
        console.log("Test user created successfully.");
    }
    catch (error) {
        console.error("Error during setup:", error);
        throw error;
    }
}), 30000); // Increase timeout to 30 seconds
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Cleaning up the database...");
    yield prismaClient_1.default.user.deleteMany();
    yield prismaClient_1.default.$disconnect();
    yield new Promise((resolve, reject) => {
        index_1.server.close((err) => {
            if (err)
                return reject(err);
            console.log("Server closed");
            resolve();
        });
    });
}));
afterEach(() => {
    jest.clearAllTimers();
});
describe("Auth API", () => {
    it("should sign up a user successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.app)
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
        const response = yield (0, supertest_1.default)(index_1.app)
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
        const response = yield (0, supertest_1.default)(index_1.app).post("/api/auth/signup").send({
            name: "Jane Doe",
            email: "invalid-email", // Invalid email
            password: "password123",
        });
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Invalid email address");
    }));
    it("should log in a user successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.app).post("/api/auth/login").send({
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
        const response = yield (0, supertest_1.default)(index_1.app).post("/api/auth/login").send({
            email: "invalid-email",
            password: "password123",
        });
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Invalid email address");
    }));
    it("should fail to log in a user with incorrect password", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.app).post("/api/auth/login").send({
            email: "john.doe@example.com",
            password: "wrongpassword",
        });
        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Invalid email or password"); // Update to match the actual error message
    }));
});
describe("GET /api/auth/me", () => {
    let testUserToken;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Create a test user and generate a JWT token for the test user
        const testUser = yield prismaClient_1.default.user.findFirst({
            where: { email: "john.doe@example.com" },
        });
        testUserToken = jsonwebtoken_1.default.sign({ id: testUser.id, email: testUser.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    }));
    it("should return the logged-in user's information", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${testUserToken}`);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Logged in user information");
        expect(response.body.data).toBeDefined();
        expect(response.body.user).toBeDefined();
        expect(response.body.user.email).toBe("john.doe@example.com");
    }));
    it("should return 401 if no token is provided", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.app).get("/api/auth/me");
        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("No token provided");
    }));
});
