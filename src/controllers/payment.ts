import { TryCatch } from "../middlewares/error";
import { Coupon } from "../models/coupon";
import ErrorHandler from "../utils/utility-class";

export const newCoupon = TryCatch(async (req, res, next) => {
  const { code, amount } = req.body;
  if (!code || !amount)
    return next(new ErrorHandler("Please enter both fields", 400));
  await Coupon.create({ code, amount });
  return res.status(201).json({
    success: true,
    message: `Coupon Created ${code} Successfully`,
  });
});
