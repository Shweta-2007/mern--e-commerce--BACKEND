"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLineCharts = exports.getBarCharts = exports.getPieCharts = exports.getDashboardStats = void 0;
const app_1 = require("../app");
const error_1 = require("../middlewares/error");
const orders_1 = require("../models/orders");
const product_1 = require("../models/product");
const user_1 = require("../models/user");
const features_1 = require("../utils/features");
exports.getDashboardStats = (0, error_1.TryCatch)(async (req, res, next) => {
    let stats;
    if (app_1.myCache.has("admin-stats")) {
        stats = JSON.parse(app_1.myCache.get("admin-stats"));
    }
    else {
        const today = new Date();
        // For revenue distribution graph
        const sixMonthsAgo = new Date();
        // This line creates a new Date object named sixMonthsAgo initialized with the current date and time.
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        //  Subtracts 6 from the current month. If the current month is, for example, March (2), subtracting 6 results in September (2 - 6 = -4).
        const thisMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: new Date(),
        };
        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            // Here we first day of this month and first day of previous. So now we can find orders of this whole month.
            end: new Date(today.getFullYear(), today.getMonth(), 0),
            // For example today is 23 feb, today.getFullYear() => 2024, today.getMonth() => feb, 0means feb 0 means january end. Thus we will get last day of previous month.
        };
        // PRODUCTS IN THIS MONTH
        const thisMonthProductsPromise = product_1.Product.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end,
            },
        });
        const lastMonthProductsPromise = product_1.Product.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            },
        });
        // USER IN THIS MONTH
        const thisMonthUsersPromise = user_1.User.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end,
            },
        });
        const lastMonthUsersPromise = user_1.User.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            },
        });
        // ORDERS IN THIS MONTH
        const thisMonthOrdersPromise = orders_1.Order.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end,
            },
        });
        const lastMonthOrdersPromise = orders_1.Order.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            },
        });
        const lastSixMonthOrdersPromise = orders_1.Order.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today,
            },
        });
        // Top transactions
        const latestTransactionsPromise = orders_1.Order.find({})
            .select(["orderItems", "discount", "total", "status"])
            .limit(4);
        const [thisMonthProducts, thisMonthUsers, thisMonthOrders, lastMonthProducts, lastMonthUsers, lastMonthOrders, productsCount, usersCount, allOrders, lastSixMonthOrders, categories, femaleUsersCount, latestTransactions,] = await Promise.all([
            thisMonthProductsPromise,
            thisMonthUsersPromise,
            thisMonthOrdersPromise,
            lastMonthProductsPromise,
            lastMonthUsersPromise,
            lastMonthOrdersPromise,
            product_1.Product.countDocuments(), // This will count the total number of products.
            user_1.User.countDocuments(),
            orders_1.Order.find({}).select("total"), // This will get the total of all Orders.
            lastSixMonthOrdersPromise,
            product_1.Product.distinct("category"),
            user_1.User.countDocuments({ gender: "female" }),
            latestTransactionsPromise,
        ]);
        const thisMonthRevenue = thisMonthOrders.reduce((total, order) => {
            return total + (order.total || 0);
        }, 0);
        const lastMonthRevenue = lastMonthOrders.reduce((total, order) => {
            return total + (order.total || 0);
        }, 0);
        const percentageChange = {
            revenue: (0, features_1.calculatePercentage)(thisMonthRevenue, lastMonthRevenue),
            product: (0, features_1.calculatePercentage)(thisMonthProducts.length, lastMonthProducts.length),
            user: (0, features_1.calculatePercentage)(thisMonthUsers.length, lastMonthUsers.length),
            order: (0, features_1.calculatePercentage)(thisMonthOrders.length, lastMonthOrders.length),
        };
        const revenue = allOrders.reduce((total, order) => {
            return total + (order.total || 0);
        }, 0);
        const count = {
            revenue,
            product: productsCount,
            user: usersCount,
            order: allOrders.length,
        };
        const orderMonthCounts = new Array(6).fill(0);
        const orderMonthlyRevenue = new Array(6).fill(0);
        lastSixMonthOrders.forEach((order) => {
            const creationDate = order.createdAt;
            const monthDifference = today.getMonth() - creationDate.getMonth();
            if (monthDifference < 6) {
                orderMonthCounts[6 - monthDifference - 1] += 1; // here 6 - 1 is used for last index, month in JavaScript is 0 based.
                orderMonthlyRevenue[6 - monthDifference - 1] += order.total;
            }
        });
        const categoryCount = await (0, features_1.getInventories)({
            categories,
            productsCount,
        });
        // Gender-ratio
        const userRatio = {
            male: usersCount - femaleUsersCount,
            female: femaleUsersCount,
        };
        const modifiedTransactions = latestTransactions.map((i) => ({
            _id: i._id,
            discount: i.discount,
            amount: i.total,
            quantity: i.orderItems.length,
            status: i.status,
        }));
        stats = {
            categoryCount,
            percentageChange,
            count,
            chart: {
                order: orderMonthCounts,
                revenue: orderMonthlyRevenue,
            },
            userRatio,
            latestTransactions: modifiedTransactions,
        };
        app_1.myCache.set("admin-stats", JSON.stringify(stats));
    }
    return res.status(200).json({
        success: true,
        stats,
    });
});
exports.getPieCharts = (0, error_1.TryCatch)(async (req, res, next) => {
    let charts;
    if (app_1.myCache.has("admin-pie-charts")) {
        charts = JSON.parse(app_1.myCache.get("admin-pie-charts"));
    }
    else {
        const [processingOrder, shippedOrder, deliveredOrder, categories, productsCount, productsOutOfStock, allOrders, allUsers, adminUsers, customerUsers,] = await Promise.all([
            orders_1.Order.countDocuments({ status: "Processing" }),
            orders_1.Order.countDocuments({ status: "Shipped" }),
            orders_1.Order.countDocuments({ status: "Delivered" }),
            product_1.Product.distinct("category"),
            product_1.Product.countDocuments(),
            product_1.Product.countDocuments({ stock: 0 }),
            orders_1.Order.find({}).select([
                "total",
                "discount",
                "subtotal",
                "tax",
                "shippingCharges",
            ]),
            user_1.User.find({}).select(["dob"]),
            user_1.User.countDocuments({ role: "admin" }),
            user_1.User.countDocuments({ role: "user" }),
        ]);
        const orderFulfillment = {
            processing: processingOrder,
            shipped: shippedOrder,
            delivered: deliveredOrder,
        };
        const productCategories = await (0, features_1.getInventories)({
            categories,
            productsCount,
        });
        const stockAvailability = {
            inStock: productsCount - productsOutOfStock,
            outOfStock: productsOutOfStock,
        };
        const grossIncome = allOrders.reduce((prev, order) => prev + (order.total || 0), 0);
        const discount = allOrders.reduce((prev, order) => prev + (order.discount || 0), 0);
        const productionCost = allOrders.reduce((prev, order) => prev + (order.shippingCharges || 0), 0);
        const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);
        const marketingCost = Math.round(grossIncome * 0.3);
        const netMargin = grossIncome - discount - productionCost - burnt - marketingCost;
        const revenueDistribution = {
            netMargin,
            discount,
            productionCost,
            burnt,
            marketingCost,
        };
        const usersAgeGroup = {
            teen: allUsers.filter((i) => i.age < 20).length,
            adult: allUsers.filter((i) => i.age >= 20 && i.age < 40).length,
            old: allUsers.filter((i) => i.age >= 40).length,
        };
        const adminCustomer = {
            admin: adminUsers,
            customer: customerUsers,
        };
        charts = {
            orderFulfillment,
            productCategories,
            stockAvailability,
            revenueDistribution,
            usersAgeGroup,
            adminCustomer,
        };
        app_1.myCache.set("admin-pie-charts", JSON.stringify(charts));
    }
    return res.status(200).json({
        success: true,
        charts,
    });
});
exports.getBarCharts = (0, error_1.TryCatch)(async (req, res, next) => { });
exports.getLineCharts = (0, error_1.TryCatch)(async (req, res, next) => { });
