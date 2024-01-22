"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Please enter Name"],
    },
    photo: {
        type: String,
        required: [true, "Please add Photo"],
    },
    price: {
        type: Number,
        required: [true, "Please enter Price"],
    },
    stock: {
        type: Number,
        required: [true, "Please enter Stock"],
    },
    category: {
        type: String,
        required: [true, "Please enter Category"],
        trim: true,
        // This trim:true will remove the space.
    },
}, { timestamps: true });
exports.Product = mongoose_1.default.model("Product", schema);
