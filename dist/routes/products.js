"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_1 = require("../controllers/product");
const multer_1 = require("../middlewares/multer");
const auth_1 = require("../middlewares/auth");
const app = express_1.default.Router();
// Create new product  - /api/v1/product/new
app.post("/new", auth_1.adminOnly, multer_1.singleUpload, product_1.newProduct);
//  To get all products with filters - /api/v1/product/all
app.get("/all", product_1.searchAllProducts);
//  To get latest 5 products - /api/v1/product/latest
app.get("/latest", product_1.getLatestProducts);
//  To get all unique Categories - /api/v1/product/categories
app.get("/categories", product_1.getAllCategories);
//  To get all products for admin - /api/v1/product/admin-products
app.get("/admin-products", auth_1.adminOnly, product_1.getAdminProducts);
// To get product by ID - /api/v1/product/Dynamic ID
app
    .route("/:id")
    .get(product_1.getProductById)
    .put(auth_1.adminOnly, multer_1.singleUpload, product_1.updateProduct)
    .delete(auth_1.adminOnly, product_1.deleteProduct);
exports.default = app;
