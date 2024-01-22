"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_1 = require("../controllers/payment");
const app = express_1.default.Router();
// Route - /api/v1/payment/coupon/new
app.post("/coupon/new", payment_1.newCoupon);
// app.get("/discount", applyDiscount);
exports.default = app;
