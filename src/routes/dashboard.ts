import express from "express";
import {
  getBarCharts,
  getDashboardStats,
  getLineCharts,
  getPieCharts,
} from "../controllers/dashboard";
import { adminOnly } from "../middlewares/auth";

const app = express.Router();

// Route - api/v1/dashboard/stats
// To show the stats to dashboard
app.get("/stats", adminOnly, getDashboardStats);

// To show pie chart data
app.get("/pie", adminOnly, getPieCharts);

app.get("/bar", adminOnly, getBarCharts);

app.get("/line", adminOnly, getLineCharts);

export default app;
