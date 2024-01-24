import { TryCatch } from "../middlewares/error";
import { Product } from "../models/product";
import {
  BaseQuery,
  NewProductRequestBody,
  SearchRequestQuery,
} from "../types/types";
import { Request } from "express";
import ErrorHandler from "../utils/utility-class";
import { rm } from "fs";
import { myCache } from "../app";
import { invalidateCache } from "../utils/features";

// Revalidate on New, Update or Delete Product $ on New Order
export const getLatestProducts = TryCatch(async (req, res, next) => {
  let products;
  if (myCache.has("latest-products")) {
    products = JSON.parse(myCache.get("latest-products") as string);
  } else {
    products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    // -1 means descending, 1 means ascending
    myCache.set("latest-products", JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    products,
  });
});

export const getAllCategories = TryCatch(async (req, res, next) => {
  let categories;
  if (myCache.has("categories")) {
    categories = JSON.parse(myCache.get("categories") as string);
  } else {
    categories = await Product.distinct("category");
    myCache.set("categories", JSON.stringify(categories));
  }

  return res.status(200).json({
    success: true,
    categories,
  });
});

export const getAdminProducts = TryCatch(async (req, res, next) => {
  let products;
  if (myCache.has("all-products")) {
    products = JSON.parse(myCache.get("all-products") as string);
  } else {
    products = await Product.find({});
    myCache.set("all-products", JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    products,
  });
});

export const getProductById = TryCatch(async (req, res, next) => {
  let product;
  const productID = req.params.id;
  if (myCache.has(`product-${productID}`)) {
    product = JSON.parse(myCache.get(`product-${productID}`) as string);
  } else {
    product = await Product.findById(productID);
    if (!product) return next(new ErrorHandler("Invalid ID", 400));
    myCache.set(`product-${productID}`, JSON.stringify(product));
  }

  return res.status(200).json({
    success: true,
    product,
  });
});

export const newProduct = TryCatch(
  async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;
    if (!photo) return next(new ErrorHandler("Please add photo", 400));

    if (!name || !price || !stock || !category) {
      rm(photo.path, () => {
        console.log("deleted");
      });
      // rm is used to remove a folder that has contents

      return next(new ErrorHandler("Please add all the details", 400));
    }

    await Product.create({
      name,
      price,
      stock,
      category: category.toLowerCase(),
      photo: photo.path,
    });

    // Invalidate
    invalidateCache({ product: true, admin: true });

    return res.status(201).json({
      success: true,
      message: "Product Created Successfully",
    });
  }
);

export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, price, stock, category } = req.body;
  const photo = req.file;

  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  if (photo) {
    rm(product.photo!, () => {
      console.log("Old Photo Deleted");
    });
    // rm is used to remove a folder that has contents

    product.photo = photo.path;
  }

  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;

  await product.save();
  // Invalidate
  invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return res.status(200).json({
    success: true,
    message: "Product Updated Successfully",
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const productID = req.params.id;
  const product = await Product.findById(productID);
  if (!product) return next(new ErrorHandler("Invalid product ID", 400));

  rm(product.photo!, () => {
    console.log("Photo Deleted");
  });

  await product.deleteOne();

  // Invalidate
  invalidateCache({
    product: true,
    admin: true,
    productId: String(product._id),
  });
  return res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});

export const searchAllProducts = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, sort, category, price } = req.query;

    const page = Number(req.query.page) || 1;

    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;

    const skip = (page - 1) * limit; // If we are on page no 2, then skip = (2-1)*8 which is equal to 8, means it will skip 8 products, so we will go on 2nd page.
    // Similarly if we are no page no 3, then it will have to skip (3-1)*8 that is 16 products, it will go on 3rd page, because each page has default 8 products if nothing is mentioned.

    const baseQuery: BaseQuery = {};

    if (search)
      baseQuery.name = {
        $regex: search, // This will help to find keyword in name
        $options: "i", //  This will make search case insensitive
      };
    if (price)
      baseQuery.price = {
        $lte: Number(price), // Less than equal to the price given
      };
    if (category) baseQuery.category = category; // category = category, so we can write shorthand

    const productsPromise = Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);

    const [products, onlyFilteredProducts] = await Promise.all([
      productsPromise,
      Product.find(baseQuery), // Here we want products with filters, without sorting or limiting them
    ]);

    const totalPage = Math.ceil(onlyFilteredProducts.length / limit);

    return res.status(200).json({
      success: true,
      products,
      totalPage,
    });
  }
);
