"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.processOrder = exports.newOrder = exports.getOrderById = exports.allOrders = exports.myOrders = void 0;
const error_1 = require("../middlewares/error");
const orders_1 = require("../models/orders");
const features_1 = require("../utils/features");
const utility_class_1 = __importDefault(require("../utils/utility-class"));
const app_1 = require("../app");
exports.myOrders = (0, error_1.TryCatch)(async (req, res, next) => {
    const { id } = req.query;
    const key = `my-orders-${id}`;
    let orders = [];
    if (app_1.myCache.has(key)) {
        orders = JSON.parse(app_1.myCache.get(key));
    }
    else {
        orders = await orders_1.Order.find({ user: id });
        app_1.myCache.set(key, JSON.stringify(orders));
    }
    return res.status(200).json({
        success: true,
        orders,
    });
});
exports.allOrders = (0, error_1.TryCatch)(async (req, res, next) => {
    let orders;
    const key = "all-orders";
    if (app_1.myCache.has(key)) {
        orders = JSON.parse(app_1.myCache.get(key));
    }
    else {
        orders = await orders_1.Order.find().populate("user", "name");
        // orders = await Order.find().populate("user");
        // Here populate(user) will give all the information of user.
        // Earlier when we have not used populate here, then we were getting only id of user. But we want name too that's why we populated. If we want only name then we can pass that in second argument. In we will get id and name of user.
        app_1.myCache.set(key, JSON.stringify(orders));
    }
    return res.status(200).json({
        success: true,
        orders,
    });
});
exports.getOrderById = (0, error_1.TryCatch)(async (req, res, next) => {
    const id = req.params.id;
    const key = `order-${id}`;
    let order;
    if (app_1.myCache.has(key)) {
        order = JSON.parse(app_1.myCache.get(key));
    }
    else {
        order = await orders_1.Order.findById(id).populate("user", "name");
        if (!order)
            return next(new utility_class_1.default(" Order Not Found", 404));
        app_1.myCache.set(key, JSON.stringify(order));
    }
    return res.status(200).json({
        success: true,
        order,
    });
});
exports.newOrder = (0, error_1.TryCatch)(async (req, res, next) => {
    const { shippingInfo, orderItems, user, subtotal, tax, shippingCharges, discount, total, } = req.body;
    const order = await orders_1.Order.create({
        shippingInfo,
        orderItems,
        user,
        subtotal,
        tax,
        shippingCharges,
        discount,
        total,
    });
    if (!shippingInfo ||
        !orderItems ||
        !user ||
        !subtotal ||
        !tax ||
        !shippingCharges ||
        !discount ||
        !total)
        return next(new utility_class_1.default("Please provide all the details", 400));
    await (0, features_1.reduceStock)(orderItems);
    (0, features_1.invalidateCache)({
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
});
exports.processOrder = (0, error_1.TryCatch)(async (req, res, next) => {
    const { id } = req.params;
    const order = await orders_1.Order.findById(id);
    if (!order)
        return next(new utility_class_1.default("Order Not Found", 404));
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
    (0, features_1.invalidateCache)({
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
exports.deleteOrder = (0, error_1.TryCatch)(async (req, res, next) => {
    const id = req.params.id;
    const order = await orders_1.Order.findById(id);
    if (!order)
        return next(new utility_class_1.default("Order Not Found", 404));
    await order.deleteOne();
    (0, features_1.invalidateCache)({
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
