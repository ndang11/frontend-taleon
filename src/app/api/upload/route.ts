import ImageKit from "@imagekit/nodejs";
import { NextResponse } from "next/server";

const imagekit = new (ImageKit as any)({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await (imagekit as any).upload({
      file: buffer,
      fileName: file.name,
      folder: "/taleon/posts",
    });

    return NextResponse.json({
      url: uploadResult.url,
      fileId: uploadResult.fileId,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to upload file to ImageKit" },
      { status: 500 },
    );
  }
}

import { Readable } from "node:stream";

if (typeof (globalThis as any).Readable === "undefined") {
  (globalThis as any).Readable = Readable;
}
