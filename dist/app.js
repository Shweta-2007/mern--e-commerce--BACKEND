"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.myCache = exports.stripe = void 0;
const express_1 = __importDefault(require("express"));
const features_1 = require("./utils/features");
const error_1 = require("./middlewares/error");
const node_cache_1 = __importDefault(require("node-cache"));
const dotenv_1 = require("dotenv");
const morgan_1 = __importDefault(require("morgan"));
// Importing Routes
const user_1 = __importDefault(require("./routes/user"));
const products_1 = __importDefault(require("./routes/products"));
const orders_1 = __importDefault(require("./routes/orders"));
const payment_1 = __importDefault(require("./routes/payment"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const stripe_1 = __importDefault(require("stripe"));
(0, dotenv_1.config)({
    path: "./.env", // path of env file
});
const port = process.env.PORT;
const mongoURI = process.env.MONGO_URI || "";
// call the function which we have made to connect mongoDB in app.ts
const stripeKey = process.env.STRIPE_KEY || "";
// stripe payment
(0, features_1.connectDB)(mongoURI);
exports.stripe = new stripe_1.default(stripeKey);
exports.myCache = new node_cache_1.default();
const app = (0, express_1.default)();
// This line should be above all routes. This is a middleware.
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
app.get("/", (req, res) => {
    res.send("API working with /api/v1");
});
// Using Routes
app.use("/api/v1/user", user_1.default);
app.use("/api/v1/product", products_1.default);
app.use("/api/v1/order", orders_1.default);
app.use("/api/v1/payment", payment_1.default);
app.use("/api/v1/dashboard", dashboard_1.default);
app.use("/uploads", express_1.default.static("uploads"));
// Middleware for error handling, This should be placed at last.
app.use(error_1.errorMiddleware);
app.listen(port, () => {
    console.log(`Server is working on http://localhost:${port}`);
});
