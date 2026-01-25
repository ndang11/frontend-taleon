import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "taleon/posts" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      // Create a readable stream from the buffer and pipe to Cloudinary
      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);
      stream.pipe(uploadStream);
    });

    return NextResponse.json({
      url: (uploadResult as UploadApiResponse).secure_url,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to upload file to Cloudinary" },
      { status: 500 },
    );
  }
}

import { Readable } from "node:stream";

if (typeof (globalThis as any).Readable === "undefined") {
  (globalThis as any).Readable = Readable;
}
