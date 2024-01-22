import express from "express";
import {
  getOrderById,
  allOrders,
  myOrders,
  newOrder,
  deleteOrder,
  processOrder,
} from "../controllers/order";
import { adminOnly } from "../middlewares/auth";

const app = express.Router();

// Route  -  /api/v1/order/new
app.post("/new", newOrder);

// Route  -  /api/v1/order/my
app.get("/my", myOrders);

// Route  -  /api/v1/order/all
app.get("/all", adminOnly, allOrders);

// Route  -
app
  .route("/:id")
  .get(getOrderById)
  .delete(adminOnly, deleteOrder)
  .put(adminOnly, processOrder);

export default app;
