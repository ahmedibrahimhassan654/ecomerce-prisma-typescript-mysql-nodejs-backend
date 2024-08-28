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
exports.server = exports.app = void 0;
const prismaClient_1 = __importDefault(require("./utils/prismaClient"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const secrets_1 = require("./secrets");
const routes_1 = __importDefault(require("./routes"));
const requestLogger_1 = __importDefault(require("./middelwares/requestLogger"));
const errorHandler_1 = __importDefault(require("./exceptions/errorHandler"));
const app = (0, express_1.default)();
exports.app = app;
// Log the current environment, database URL, and port
console.log(`Environment: ${secrets_1.config.environment}`);
console.log(`Database URL: ${secrets_1.config.databaseUrl}`);
console.log(`Port: ${secrets_1.config.port}`);
// Middleware to parse JSON bodies
app.use(body_parser_1.default.json());
app.use(requestLogger_1.default);
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send("working ");
}));
app.use("/api", routes_1.default);
// Use the error handler middleware
app.use(errorHandler_1.default);
const server = app.listen(secrets_1.config.port, () => {
    console.log(`Server is running on port ${secrets_1.config.port}`);
});
exports.server = server;
process.on("SIGTERM", () => __awaiter(void 0, void 0, void 0, function* () {
    yield prismaClient_1.default.$disconnect();
    server.close(() => {
        console.log("Process terminated");
    });
}));
