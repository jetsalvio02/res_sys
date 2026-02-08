import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { roomTypeImages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  _req: Request,
  { params }: { params: { imageId: string } },
) {
  const images = await database
    .select()
    .from(roomTypeImages)
    .where(eq(roomTypeImages.id, Number(params.imageId)));

  const image = images[0];

  if (!image) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await database
    .update(roomTypeImages)
    .set({ isPrimary: false })
    .where(eq(roomTypeImages.roomTypeId, image.roomTypeId));

  await database
    .update(roomTypeImages)
    .set({ isPrimary: true })
    .where(eq(roomTypeImages.id, image.id));

  return NextResponse.json({ success: true });
}
