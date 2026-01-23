import { unlink } from "node:fs/promises";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export class CloudinaryService {
  async uploadImage(file: any) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "taleon/posts",
      resource_type: "image",
    });

    await unlink(file.path); // clean temp file
    return result.secure_url;
  }
}
