import express from "express";
import { connectDB } from "./utils/features";
import { errorMiddleware } from "./middlewares/error";
import NodeCache from "node-cache";
import { config } from "dotenv";
import morgan from "morgan";

// Importing Routes
import userRoute from "./routes/user";
import productRoute from "./routes/products";
import orderRoute from "./routes/orders";
import paymentRoute from "./routes/payment";
import dashboardRoute from "./routes/dashboard";
import Stripe from "stripe";

config({
  path: "./.env", // path of env file
});

const port = process.env.PORT;

const mongoURI = process.env.MONGO_URI || "";
// call the function which we have made to connect mongoDB in app.ts
const stripeKey = process.env.STRIPE_KEY || "";

// stripe payment

connectDB(mongoURI);

export const stripe = new Stripe(stripeKey);
export const myCache = new NodeCache();

const app = express();

// This line should be above all routes. This is a middleware.
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("API working with /api/v1");
});

// Using Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/dashboard", dashboardRoute);

app.use("/uploads", express.static("uploads"));
// Middleware for error handling, This should be placed at last.
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is working on http://localhost:${port}`);
});
