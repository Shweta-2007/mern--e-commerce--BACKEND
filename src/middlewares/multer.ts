import multer from "multer";
import { v4 as uuid } from "uuid";

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, "uploads");
  },
  filename(req, file, callback) {
    const id = uuid();
    const extName = file.originalname.split(".").pop();
    callback(null, `${id}.${extName}`);
  },
});

export const singleUpload = multer({ storage }).single("photo");

// multer().single("file");

// we can access this file using req.file. This file will be stored on temporary storage(RAM) which is a default storage, and from there we can upload that on cloud and that will be cleaned from RAM.
// But we can also pass disk storage, rather than storing on default, it can also be stored inside our file, which will be permanent.

// callback: (error: Error | null, destination: string) => void
