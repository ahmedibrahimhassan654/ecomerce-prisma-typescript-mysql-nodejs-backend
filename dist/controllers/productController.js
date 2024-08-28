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
exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getProducts = exports.createProduct = void 0;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const logger_1 = __importDefault(require("../utils/logger"));
const ErrorResponse_1 = __importDefault(require("../exceptions/ErrorResponse"));
const createProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, price, tags } = req.body;
    if (!name || !price) {
        logger_1.default.warn("Create product failed: Missing required fields");
        return next(new ErrorResponse_1.default("Name and price are required", 400));
    }
    try {
        const product = yield prismaClient_1.default.product.create({
            data: { name, description, price, tags },
        });
        res.status(201).json({ success: true, data: product });
    }
    catch (error) {
        logger_1.default.error("Create product failed: Internal server error");
        next(error);
    }
});
exports.createProduct = createProduct;
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield prismaClient_1.default.product.findMany();
        res.status(201).json({ success: true, data: products });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
});
exports.getProducts = getProducts;
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const product = yield prismaClient_1.default.product.findUnique({
            where: { id: Number(id) },
        });
        if (product) {
            res.status(201).json({ success: true, data: product });
        }
        else {
            res.status(404).json({ error: "Product not found" });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch product" });
    }
});
exports.getProductById = getProductById;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, description, price, tags } = req.body;
    try {
        const product = yield prismaClient_1.default.product.update({
            where: { id: Number(id) },
            data: { name, description, price, tags },
        });
        res.status(201).json({ success: true, data: product });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update product" });
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deletedproduct = yield prismaClient_1.default.product.delete({
            where: { id: Number(id) },
        });
        res.status(201).json({ success: true, data: deletedproduct });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete product" });
    }
});
exports.deleteProduct = deleteProduct;
