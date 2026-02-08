import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { roomTypeImages } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  //   const images = await db.query.roomTypeImages.findMany({
  //     where: eq(roomTypeImages.roomTypeId, Number(params.id)),
  //     orderBy: (img, { desc }) => [desc(img.isPrimary)],
  //   });

  const id = (await params).id;

  const images = await database
    .select()
    .from(roomTypeImages)
    .where(eq(roomTypeImages.roomTypeId, Number(id)))
    .orderBy(desc(roomTypeImages.isPrimary));

  return NextResponse.json(images);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { imageUrl, isPrimary } = await req.json();

  const id = (await params).id;

  if (isPrimary) {
    await database
      .update(roomTypeImages)
      .set({ isPrimary: false })
      .where(eq(roomTypeImages.roomTypeId, Number(id)));
  }

  await database.insert(roomTypeImages).values({
    roomTypeId: Number(id),
    imageUrl,
    isPrimary: isPrimary ?? false,
  });

  return NextResponse.json({ success: true });
}
