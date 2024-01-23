"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePercentage = exports.reduceStock = exports.invalidateCache = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("../app");
const product_1 = require("../models/product");
const connectDB = (uri) => {
    mongoose_1.default
        .connect(uri, {
        dbName: "Ecommerce_24",
    })
        .then((c) => console.log(`DB Connected to ${c.connection.host}`))
        .catch((e) => console.log(e));
};
exports.connectDB = connectDB;
const invalidateCache = async ({ product, order, admin, userId, orderId, productId, }) => {
    if (product) {
        const productKeys = [
            "latest-products",
            "categories",
            "all-products",
        ];
        if (typeof productId === "string")
            productKeys.push(`product-${productId}`);
        if (typeof productId === "object")
            productId.forEach((i) => productKeys.push(`product-${i}`));
        app_1.myCache.del(productKeys);
    }
    if (order) {
        const orderKeys = [
            "all-orders",
            `my-orders-${userId}`,
            `order-${orderId}`,
        ];
        app_1.myCache.del(orderKeys);
    }
    if (admin) {
    }
};
exports.invalidateCache = invalidateCache;
const reduceStock = async (orderItems) => {
    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await product_1.Product.findById(order.productId);
        if (!product)
            throw new Error("Product Not Found");
        product.stock -= order.quantity;
        await product.save();
    }
};
exports.reduceStock = reduceStock;
// DASHBOARD STATISTICS FUNCTIONS
const calculatePercentage = (thisMonth, lastMonth) => {
    if (lastMonth === 0)
        return thisMonth * 100;
    const percent = ((thisMonth - lastMonth) / lastMonth) * 100;
    return Number(percent.toFixed(0));
};
exports.calculatePercentage = calculatePercentage;
