import express from "express";
import {
  deleteProduct,
  getAdminProducts,
  getAllCategories,
  getLatestProducts,
  getProductById,
  newProduct,
  searchAllProducts,
  updateProduct,
} from "../controllers/product";

import { singleUpload } from "../middlewares/multer";
import { adminOnly } from "../middlewares/auth";

const app = express.Router();

// Create new product  - /api/v1/product/new
app.post("/new", adminOnly, singleUpload, newProduct);

//  To get all products with filters - /api/v1/product/all
app.get("/all", searchAllProducts);

//  To get latest 5 products - /api/v1/product/latest
app.get("/latest", getLatestProducts);

//  To get all unique Categories - /api/v1/product/categories
app.get("/categories", getAllCategories);

//  To get all products for admin - /api/v1/product/admin-products
app.get("/admin-products", adminOnly, getAdminProducts);

// To get product by ID - /api/v1/product/Dynamic ID
app
  .route("/:id")
  .get(getProductById)
  .put(adminOnly, singleUpload, updateProduct)
  .delete(adminOnly, deleteProduct);

export default app;
