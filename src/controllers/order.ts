import { TryCatch } from "../middlewares/error";
import { Request } from "express";
import { NewOrderRequestBody } from "../types/types";
import { Order } from "../models/orders";
import { invalidateCache, reduceStock } from "../utils/features";
import ErrorHandler from "../utils/utility-class";
import { myCache } from "../app";

export const myOrders = TryCatch(async (req, res, next) => {
  const { id } = req.query;
  const key = `my-orders-${id}`;
  let orders = [];
  if (myCache.has(key)) {
    orders = JSON.parse(myCache.get(key) as string);
  } else {
    orders = await Order.find({ user: id });
    myCache.set(key, JSON.stringify(orders));
  }
  return res.status(200).json({
    success: true,
    orders,
  });
});

export const allOrders = TryCatch(async (req, res, next) => {
  let orders;
  const key = "all-orders";
  if (myCache.has(key)) {
    orders = JSON.parse(myCache.get(key) as string);
  } else {
    orders = await Order.find().populate("user", "name");
    // orders = await Order.find().populate("user");
    // Here populate(user) will give all the information of user.
    // Earlier when we have not used populate here, then we were getting only id of user. But we want name too that's why we populated. If we want only name then we can pass that in second argument. In we will get id and name of user.
    myCache.set(key, JSON.stringify(orders));
  }

  return res.status(200).json({
    success: true,
    orders,
  });
});

export const getOrderById = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const key = `order-${id}`;

  let order;
  if (myCache.has(key)) {
    order = JSON.parse(myCache.get(key) as string);
  } else {
    order = await Order.findById(id).populate("user", "name");
    if (!order) return next(new ErrorHandler(" Order Not Found", 404));
    myCache.set(key, JSON.stringify(order));
  }
  return res.status(200).json({
    success: true,
    order,
  });
});

export const newOrder = TryCatch(
  async (req: Request<{}, {}, NewOrderRequestBody>, res, next) => {
    const {
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    } = req.body;

    const order = await Order.create({
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    });

    if (
      !shippingInfo ||
      !orderItems ||
      !user ||
      !subtotal ||
      !tax ||
      !shippingCharges ||
      !discount ||
      !total
    )
      return next(new ErrorHandler("Please provide all the details", 400));

    await reduceStock(orderItems);

    await invalidateCache({
      product: true,
      order: true,
      admin: true,
      userId: user,
      productId: order.orderItems.map((i) => String(i.productId)),
    });

    return res.status(201).json({
      success: true,
      message: "Order Placed Successfully",
    });
  }
);

export const processOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findById(id);

  if (!order) return next(new ErrorHandler("Order Not Found", 404));

  switch (order.status) {
    case "Processing":
      order.status = "Shipped";
      break;
    case "Shipped":
      order.status = "Delivered";
      break;
    default:
      order.status = "Delivered";
      break;
  }

  await order.save();

  await invalidateCache({
    product: false,
    order: true,
    admin: true,
    userId: order.user,
    orderId: String(order._id),
  });

  return res.status(200).json({
    success: true,
    message: "Order Processed Successfully",
  });
});

export const deleteOrder = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const order = await Order.findById(id);

  if (!order) return next(new ErrorHandler("Order Not Found", 404));

  await order.deleteOne();
  await invalidateCache({
    product: false,
    order: true,
    admin: true,
    userId: order.user,
    orderId: String(order._id),
  });

  return res.status(200).json({
    success: true,
    message: "Order Deleted Successfully",
  });
});
