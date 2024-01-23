import express from "express";
import {
  allCoupons,
  applyDiscount,
  deleteCoupon,
  newCoupon,
} from "../controllers/payment";
import { adminOnly } from "../middlewares/auth";

const app = express.Router();

// Route - /api/v1/payment/coupon/discount
app.get("/discount", applyDiscount);

// Route - /api/v1/payment/coupon/new
app.post("/coupon/new", adminOnly, newCoupon);

// To show available coupons through API, without going on database
// Route - /api/v1/payment/coupon/all
app.get("/coupon/all", adminOnly, allCoupons);

// Route - /api/v1/payment/coupon/:id
app.delete("/coupon/:id", adminOnly, deleteCoupon);

export default app;
