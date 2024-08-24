"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const secrets_1 = require("../secrets");
const prisma = new client_1.PrismaClient({
    log: ["query"],
    datasources: {
        db: {
            url: secrets_1.config.databaseUrl,
        },
    },
});
exports.default = prisma;
