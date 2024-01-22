import { Request, Response, NextFunction } from "express";
import { User } from "../models/user";
import { NewUserRequestBody } from "../types/types";
import { TryCatch } from "../middlewares/error";
import ErrorHandler from "../utils/utility-class";
export const newUser = TryCatch(
  async (
    req: Request<{}, {}, NewUserRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, photo, gender, dob, _id } = req.body;
    let user = await User.findById(_id);
    if (user)
      return res
        .status(200)
        .json({ success: true, message: `Welcome, ${user.name}` });

    if (!_id || !name || !email || !gender || !dob || !photo)
      return next(new ErrorHandler("Please add all fields", 400));
    user = await User.create({
      name,
      email,
      photo,
      gender,
      dob: new Date(dob),
      _id,
    });
    return res
      .status(201)
      .json({ success: true, message: `Welcome, ${user.name}` });
  }
);

export const getAllUsers = TryCatch(async (req, res, next) => {
  const users = await User.find({});
  return res.status(200).json({
    success: true,
    users,
  });
});

export const getUser = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if (!user) return next(new ErrorHandler("Invalid ID", 400));
  return res.status(200).json({
    success: true,
    user,
  });
});

export const deleteUser = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if (!user) return next(new ErrorHandler("Invalid ID", 400));

  await User.deleteOne();
  return res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});
