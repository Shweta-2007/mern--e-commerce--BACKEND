"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const order_1 = require("../controllers/order");
const auth_1 = require("../middlewares/auth");
const app = express_1.default.Router();
// Route  -  /api/v1/order/new
app.post("/new", order_1.newOrder);
// Route  -  /api/v1/order/my
app.get("/my", order_1.myOrders);
// Route  -  /api/v1/order/all
app.get("/all", auth_1.adminOnly, order_1.allOrders);
// Route  -
app
    .route("/:id")
    .get(order_1.getOrderById)
    .delete(auth_1.adminOnly, order_1.deleteOrder)
    .put(auth_1.adminOnly, order_1.processOrder);
exports.default = app;
