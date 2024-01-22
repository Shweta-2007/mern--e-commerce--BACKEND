"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controllers/user");
const auth_1 = require("../middlewares/auth");
const app = express_1.default.Router();
// Route: /api/v1/user/new
app.post("/new", user_1.newUser);
// Route: /api/v1/user/all
app.get("/all", auth_1.adminOnly, user_1.getAllUsers);
// Route: /api/v1/user/dynamicID
app.get("/:id", user_1.getUser);
app.delete("/:id", auth_1.adminOnly, user_1.deleteUser);
// If route is same then we can do chaining as well
// app.route("/:id").get(getUser).delete(deleteUser);
exports.default = app;
