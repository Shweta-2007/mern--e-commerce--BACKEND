import express from "express";
import { deleteUser, getAllUsers, getUser, newUser } from "../controllers/user";
import { adminOnly } from "../middlewares/auth";
const app = express.Router();

// Route: /api/v1/user/new
app.post("/new", newUser);

// Route: /api/v1/user/all
app.get("/all", adminOnly, getAllUsers);

// Route: /api/v1/user/dynamicID
app.get("/:id", getUser);
app.delete("/:id", adminOnly, deleteUser);

// If route is same then we can do chaining as well
// app.route("/:id").get(getUser).delete(deleteUser);

export default app;
