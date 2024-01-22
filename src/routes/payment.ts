import express from "express";
import { newCoupon } from "../controllers/payment";

const app = express.Router();

// Route - /api/v1/payment/coupon/new
app.post("/coupon/new", newCoupon);

// app.get("/discount", applyDiscount);

export default app;
