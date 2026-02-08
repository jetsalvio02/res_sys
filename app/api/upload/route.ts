import { NextResponse } from "next/server";
import { uploadImageFromBuffer } from "@/lib/cloudinary";

export async function POST(req: Request) {
  const formData = await req.formData();

  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string | null) ?? undefined;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const result = await uploadImageFromBuffer(buffer, {
    folder,
  });

  return NextResponse.json({ url: result.secure_url });
}

