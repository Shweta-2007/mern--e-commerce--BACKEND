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

export const applyDiscount = TryCatch(async (req, res, next) => {
  const { coupon } = req.query;

  const discount = await Coupon.findOne({ code: coupon });

  if (!discount) return next(new ErrorHandler("Invalid Coupon Code", 400));

  return res.status(200).json({
    success: true,
    discount: discount.amount,
  });
});

export const allCoupons = TryCatch(async (req, res, next) => {
  const code = await Coupon.find();

  if (!code) return next(new ErrorHandler("No Coupon Code Available", 400));

  return res.status(200).json({
    success: true,
    code,
  });
});

export const deleteCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const code = await Coupon.findById(id);
  if (!code) return next(new ErrorHandler("Invalid Coupon Code", 400));
  await code.deleteOne();

  return res.status(200).json({
    success: true,
    message: `Coupon ${code} Deleted Successfully`,
  });
});
