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
        const [thisMonthProducts, thisMonthUsers, thisMonthOrders, lastMonthProducts, lastMonthUsers, lastMonthOrders, productsCount, usersCount, allOrders, lastSixMonthOrders, categories,] = await Promise.all([
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
        const categoriesCountPromise = categories.map((category) => {
            return product_1.Product.countDocuments({ category });
        });
        const categoriesCount = await Promise.all(categoriesCountPromise);
        const categoryCount = [];
        categories.forEach((category, i) => {
            categoryCount.push({
                // laptop:1
                [category]: Math.round((categoriesCount[i] / productsCount) * 100),
            });
        });
        stats = {
            categoryCount,
            percentageChange,
            count,
            chart: {
                order: orderMonthCounts,
                revenue: orderMonthlyRevenue,
            },
        };
    }
    return res.status(200).json({
        success: true,
        stats,
    });
});
exports.getPieCharts = (0, error_1.TryCatch)(async (req, res, next) => { });
exports.getBarCharts = (0, error_1.TryCatch)(async (req, res, next) => { });
exports.getLineCharts = (0, error_1.TryCatch)(async (req, res, next) => { });
