"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCoupon = exports.allCoupons = exports.applyDiscount = exports.newCoupon = exports.createPaymentIntent = void 0;
const app_1 = require("../app");
const error_1 = require("../middlewares/error");
const coupon_1 = require("../models/coupon");
const utility_class_1 = __importDefault(require("../utils/utility-class"));
exports.createPaymentIntent = (0, error_1.TryCatch)(async (req, res, next) => {
    const { amount } = req.body;
    if (!amount)
        return next(new utility_class_1.default("Please enter amount", 400));
    const paymentIntent = await app_1.stripe.paymentIntents.create({
        amount: Number(amount) * 100,
        currency: "inr",
    });
    return res.status(201).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
    });
});
exports.newCoupon = (0, error_1.TryCatch)(async (req, res, next) => {
    const { code, amount } = req.body;
    if (!code || !amount)
        return next(new utility_class_1.default("Please enter both fields", 400));
    await coupon_1.Coupon.create({ code, amount });
    return res.status(201).json({
        success: true,
        message: `Coupon ${code} Created  Successfully`,
    });
});
exports.applyDiscount = (0, error_1.TryCatch)(async (req, res, next) => {
    const { coupon } = req.query;
    const discount = await coupon_1.Coupon.findOne({ code: coupon });
    if (!discount)
        return next(new utility_class_1.default("Invalid Coupon Code", 400));
    return res.status(200).json({
        success: true,
        discount: discount.amount,
    });
});
exports.allCoupons = (0, error_1.TryCatch)(async (req, res, next) => {
    const code = await coupon_1.Coupon.find();
    if (!code)
        return next(new utility_class_1.default("No Coupon Code Available", 400));
    return res.status(200).json({
        success: true,
        code,
    });
});
exports.deleteCoupon = (0, error_1.TryCatch)(async (req, res, next) => {
    const { id } = req.params;
    const code = await coupon_1.Coupon.findById(id);
    if (!code)
        return next(new utility_class_1.default("Invalid Coupon Code", 400));
    await code.deleteOne();
    return res.status(200).json({
        success: true,
        message: `Coupon ${code} Deleted Successfully`,
    });
});
