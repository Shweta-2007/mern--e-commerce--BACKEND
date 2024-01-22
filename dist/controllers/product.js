"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchAllProducts = exports.deleteProduct = exports.updateProduct = exports.newProduct = exports.getProductById = exports.getAdminProducts = exports.getAllCategories = exports.getLatestProducts = void 0;
const error_1 = require("../middlewares/error");
const product_1 = require("../models/product");
const utility_class_1 = __importDefault(require("../utils/utility-class"));
const fs_1 = require("fs");
const app_1 = require("../app");
const features_1 = require("../utils/features");
// Revalidate on New, Update or Delete Product $ on New Order
exports.getLatestProducts = (0, error_1.TryCatch)(async (req, res, next) => {
    let products;
    if (app_1.myCache.has("latest-products")) {
        products = JSON.parse(app_1.myCache.get("latest-products"));
    }
    else {
        products = await product_1.Product.find({}).sort({ createdAt: -1 }).limit(5);
        // -1 means descending, 1 means ascending
        app_1.myCache.set("latest-products", JSON.stringify(products));
    }
    return res.status(200).json({
        success: true,
        products,
    });
});
exports.getAllCategories = (0, error_1.TryCatch)(async (req, res, next) => {
    let categories;
    if (app_1.myCache.has("categories")) {
        categories = JSON.parse(app_1.myCache.get("categories"));
    }
    else {
        categories = await product_1.Product.distinct("category");
        app_1.myCache.set("categories", JSON.stringify(categories));
    }
    return res.status(200).json({
        success: true,
        categories,
    });
});
exports.getAdminProducts = (0, error_1.TryCatch)(async (req, res, next) => {
    let products;
    if (app_1.myCache.has("all-products")) {
        products = JSON.parse(app_1.myCache.get("all-products"));
    }
    else {
        products = await product_1.Product.find({});
        app_1.myCache.set("all-products", JSON.stringify(products));
    }
    return res.status(200).json({
        success: true,
        products,
    });
});
exports.getProductById = (0, error_1.TryCatch)(async (req, res, next) => {
    let product;
    const productID = req.params.id;
    if (app_1.myCache.has(`product-${productID}`)) {
        product = JSON.parse(app_1.myCache.get(`product-${productID}`));
    }
    else {
        product = await product_1.Product.findById(productID);
        if (!product)
            return next(new utility_class_1.default("Invalid ID", 400));
        app_1.myCache.set(`product-${productID}`, JSON.stringify(product));
    }
    return res.status(200).json({
        success: true,
        product,
    });
});
exports.newProduct = (0, error_1.TryCatch)(async (req, res, next) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;
    if (!photo)
        return next(new utility_class_1.default("Please add photo", 400));
    if (!name || !price || !stock || !category) {
        (0, fs_1.rm)(photo.path, () => {
            console.log("deleted");
        });
        // rm is used to remove a folder that has contents
        return next(new utility_class_1.default("Please add all the details", 400));
    }
    await product_1.Product.create({
        name,
        price,
        stock,
        category: category.toLowerCase(),
        photo: photo.path,
    });
    // Invalidate
    await (0, features_1.invalidateCache)({ product: true });
    return res.status(201).json({
        success: true,
        message: "Product Created Successfully",
    });
});
exports.updateProduct = (0, error_1.TryCatch)(async (req, res, next) => {
    const { id } = req.params;
    const { name, price, stock, category } = req.body;
    const photo = req.file;
    const product = await product_1.Product.findById(id);
    if (!product)
        return next(new utility_class_1.default("Product not found", 404));
    if (photo) {
        (0, fs_1.rm)(product.photo, () => {
            console.log("Old Photo Deleted");
        });
        // rm is used to remove a folder that has contents
        product.photo = photo.path;
    }
    if (name)
        product.name = name;
    if (price)
        product.price = price;
    if (stock)
        product.stock = stock;
    if (category)
        product.category = category;
    await product.save();
    // Invalidate
    await (0, features_1.invalidateCache)({ product: true, productId: String(product._id) });
    return res.status(200).json({
        success: true,
        message: "Product Updated Successfully",
    });
});
exports.deleteProduct = (0, error_1.TryCatch)(async (req, res, next) => {
    const productID = req.params.id;
    const product = await product_1.Product.findById(productID);
    if (!product)
        return next(new utility_class_1.default("Invalid product ID", 400));
    (0, fs_1.rm)(product.photo, () => {
        console.log("Photo Deleted");
    });
    await product.deleteOne();
    // Invalidate
    await (0, features_1.invalidateCache)({ product: true, productId: String(product._id) });
    return res.status(200).json({
        success: true,
        message: "Product Deleted Successfully",
    });
});
exports.searchAllProducts = (0, error_1.TryCatch)(async (req, res, next) => {
    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit; // If we are on page no 2, then skip = (2-1)*8 which is equal to 8, means it will skip 8 products, so we will go on 2nd page.
    // Similarly if we are no page no 3, then it will have to skip (3-1)*8 that is 16 products, it will go on 3rd page, because each page has default 8 products if nothing is mentioned.
    const baseQuery = {};
    if (search)
        baseQuery.name = {
            $regex: search, // This will help to find keyword in name
            $options: "i", //  This will make search case insensitive
        };
    if (price)
        baseQuery.price = {
            $lte: Number(price), // Less than equal to the price given
        };
    if (category)
        baseQuery.category = category; // category = category, so we can write shorthand
    const productsPromise = product_1.Product.find(baseQuery)
        .sort(sort && { price: sort === "asc" ? 1 : -1 })
        .limit(limit)
        .skip(skip);
    const [products, onlyFilteredProducts] = await Promise.all([
        productsPromise,
        product_1.Product.find(baseQuery), // Here we want products with filters, without sorting or limiting them
    ]);
    const totalPage = Math.ceil(onlyFilteredProducts.length / limit);
    return res.status(200).json({
        success: true,
        products,
        totalPage,
    });
});
