"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newCoupon = void 0;
const error_1 = require("../middlewares/error");
const coupon_1 = require("../models/coupon");
const utility_class_1 = __importDefault(require("../utils/utility-class"));
exports.newCoupon = (0, error_1.TryCatch)(async (req, res, next) => {
    const { code, amount } = req.body;
    if (!code || !amount)
        return next(new utility_class_1.default("Please enter both fields", 400));
    await coupon_1.Coupon.create({ code, amount });
    return res.status(201).json({
        success: true,
        message: `Coupon Created ${code} Successfully`,
    });
});
