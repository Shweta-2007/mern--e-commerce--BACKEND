"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.singleUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const storage = multer_1.default.diskStorage({
    destination(req, file, callback) {
        callback(null, "uploads");
    },
    filename(req, file, callback) {
        const id = (0, uuid_1.v4)();
        const extName = file.originalname.split(".").pop();
        callback(null, `${id}.${extName}`);
    },
});
exports.singleUpload = (0, multer_1.default)({ storage }).single("photo");
// multer().single("file");
// we can access this file using req.file. This file will be stored on temporary storage(RAM) which is a default storage, and from there we can upload that on cloud and that will be cleaned from RAM.
// But we can also pass disk storage, rather than storing on default, it can also be stored inside our file, which will be permanent.
// callback: (error: Error | null, destination: string) => void
