import { User } from "../models/user";
import ErrorHandler from "../utils/utility-class";
import { TryCatch } from "./error";

// Middleware to make sure that only Admin is allowed.
export const adminOnly = TryCatch(async (req, res, next) => {
  const id = req.query;
  if (!id) return next(new ErrorHandler("Please Login First", 401));

  const user = await User.findById(id);
  if (!user) return next(new ErrorHandler("Please Provide Correct ID", 401));
  if (user.role !== "admin")
    return next(new ErrorHandler("Only Admin can access that", 403));

  next();
});
