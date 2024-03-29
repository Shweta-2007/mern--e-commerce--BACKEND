"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_1 = require("../controllers/payment");
const auth_1 = require("../middlewares/auth");
const app = express_1.default.Router();
app.post("/create", payment_1.createPaymentIntent);
// Route - /api/v1/payment/coupon/discount
app.get("/discount", payment_1.applyDiscount);
// Route - /api/v1/payment/coupon/new
app.post("/coupon/new", auth_1.adminOnly, payment_1.newCoupon);
// To show available coupons through API, without going on database
// Route - /api/v1/payment/coupon/all
app.get("/coupon/all", auth_1.adminOnly, payment_1.allCoupons);
// Route - /api/v1/payment/coupon/:id
app.delete("/coupon/:id", auth_1.adminOnly, payment_1.deleteCoupon);
exports.default = app;
