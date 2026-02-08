import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { roomTypeImages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ imageId: string }> },
) {
  //   const image = await database.query.roomTypeImages.findFirst({
  //     where: eq(roomTypeImages.id, Number(params.imageId)),
  //   });

  const imageId = (await params).imageId;

  const images = await database
    .select()
    .from(roomTypeImages)
    .where(eq(roomTypeImages.id, Number(imageId)));

  const image = images[0];

  if (!image) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await database.delete(roomTypeImages).where(eq(roomTypeImages.id, image.id));

  return NextResponse.json({ success: true });
}
