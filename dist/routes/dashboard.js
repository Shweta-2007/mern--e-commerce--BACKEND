"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dashboard_1 = require("../controllers/dashboard");
const auth_1 = require("../middlewares/auth");
const app = express_1.default.Router();
// Route - api/v1/dashboard/stats
// To show the stats to dashboard
app.get("/stats", auth_1.adminOnly, dashboard_1.getDashboardStats);
// To show pie chart data
app.get("/pie", auth_1.adminOnly, dashboard_1.getPieCharts);
app.get("/bar", auth_1.adminOnly, dashboard_1.getBarCharts);
app.get("/line", auth_1.adminOnly, dashboard_1.getLineCharts);
exports.default = app;
