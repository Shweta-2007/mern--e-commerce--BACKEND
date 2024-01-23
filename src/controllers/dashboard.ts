import { myCache } from "../app";
import { TryCatch } from "../middlewares/error";
import { Order } from "../models/orders";
import { Product } from "../models/product";
import { User } from "../models/user";
import { calculatePercentage } from "../utils/features";

export const getDashboardStats = TryCatch(async (req, res, next) => {
  let stats;
  if (myCache.has("admin-stats")) {
    stats = JSON.parse(myCache.get("admin-stats") as string);
  } else {
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

    const thisMonthProductsPromise = Product.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthProductsPromise = Product.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    // USER IN THIS MONTH

    const thisMonthUsersPromise = User.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthUsersPromise = User.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    // ORDERS IN THIS MONTH

    const thisMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const lastSixMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: sixMonthsAgo,
        $lte: today,
      },
    });

    // Top transactions
    const latestTransactionsPromise = Order.find({})
      .select(["orderItems", "discount", "total", "status"])
      .limit(4);

    const [
      thisMonthProducts,
      thisMonthUsers,
      thisMonthOrders,
      lastMonthProducts,
      lastMonthUsers,
      lastMonthOrders,
      productsCount,
      usersCount,
      allOrders,
      lastSixMonthOrders,
      categories,
      femaleUsersCount,
      latestTransactions,
    ] = await Promise.all([
      thisMonthProductsPromise,
      thisMonthUsersPromise,
      thisMonthOrdersPromise,
      lastMonthProductsPromise,
      lastMonthUsersPromise,
      lastMonthOrdersPromise,
      Product.countDocuments(), // This will count the total number of products.
      User.countDocuments(),
      Order.find({}).select("total"), // This will get the total of all Orders.
      lastSixMonthOrdersPromise,
      Product.distinct("category"),
      User.countDocuments({ gender: "female" }),
      latestTransactionsPromise,
    ]);

    const thisMonthRevenue = thisMonthOrders.reduce((total, order) => {
      return total + (order.total || 0);
    }, 0);

    const lastMonthRevenue = lastMonthOrders.reduce((total, order) => {
      return total + (order.total || 0);
    }, 0);

    const percentageChange = {
      revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
      product: calculatePercentage(
        thisMonthProducts.length,
        lastMonthProducts.length
      ),
      user: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
      order: calculatePercentage(
        thisMonthOrders.length,
        lastMonthOrders.length
      ),
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
      return Product.countDocuments({ category });
    });

    const categoriesCount = await Promise.all(categoriesCountPromise);

    const categoryCount: Record<string, number>[] = [];

    categories.forEach((category, i) => {
      categoryCount.push({
        // laptop:1
        [category]: Math.round((categoriesCount[i] / productsCount) * 100),
      });
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
  }

  return res.status(200).json({
    success: true,
    stats,
  });
});

export const getPieCharts = TryCatch(async (req, res, next) => {});

export const getBarCharts = TryCatch(async (req, res, next) => {});

export const getLineCharts = TryCatch(async (req, res, next) => {});
