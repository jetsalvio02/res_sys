import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import {
  roomTypes,
  roomTypeImages,
  rooms,
  roomRates,
  reservations,
  reservationRooms,
} from "@/lib/db/schema";
import { eq, notInArray, inArray } from "drizzle-orm";
import { uploadImageFromBuffer } from "@/lib/cloudinary";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const roomTypeRows = await database
    .select()
    .from(roomTypes)
    .where(eq(roomTypes.id, Number(id)));

  const roomType = roomTypeRows[0];

  if (!roomType) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const images = await database
    .select()
    .from(roomTypeImages)
    .where(eq(roomTypeImages.roomTypeId, roomType.id));

  return NextResponse.json({
    id: roomType.id,
    name: roomType.name,
    description: roomType.description,
    maxGuests: roomType.maxGuests,
    images: images.map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      isPrimary: img.isPrimary,
    })),
  });
}

/* =========================
   PATCH (EDIT + IMAGES)
========================= */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const roomTypeId = Number(id);

  const formData = await req.formData();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const maxGuests = Number(formData.get("maxGuests"));
  const primaryKey = formData.get("primaryKey") as string;

  const remainingImages = JSON.parse(
    (formData.get("remainingImages") as string) || "[]",
  ) as number[];

  /* 1️⃣ UPDATE ROOM TYPE */
  await database
    .update(roomTypes)
    .set({ name, description, maxGuests })
    .where(eq(roomTypes.id, roomTypeId));

  /* 2️⃣ DELETE REMOVED IMAGES */
  if (remainingImages.length > 0) {
    await database
      .delete(roomTypeImages)
      .where(eq(roomTypeImages.roomTypeId, roomTypeId))
      .where(notInArray(roomTypeImages.id, remainingImages));
  }

  /* 3️⃣ RESET PRIMARY IMAGE */
  await database
    .update(roomTypeImages)
    .set({ isPrimary: false })
    .where(eq(roomTypeImages.roomTypeId, roomTypeId));

  const files = formData.getAll("images") as File[];
  const newImageIds: number[] = [];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadImageFromBuffer(buffer, {
      folder: "room-types",
    });

    const [img] = await database
      .insert(roomTypeImages)
      .values({
        roomTypeId,
        imageUrl: result.secure_url,
        isPrimary: false,
      })
      .returning();

    newImageIds.push(img.id);
  }

  /* 5️⃣ SET PRIMARY IMAGE */
  if (primaryKey) {
    const [type, key] = primaryKey.split("-");

    const imageId =
      type === "existing" ? Number(key) : newImageIds[Number(key)];

    if (imageId) {
      await database
        .update(roomTypeImages)
        .set({ isPrimary: true })
        .where(eq(roomTypeImages.id, imageId));
    }
  }

  return NextResponse.json({ success: true });
}

/* =========================
   DELETE ROOM TYPE
========================= */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const roomTypeId = Number(id);

  try {
    const roomsForType = await database
      .select({ id: rooms.id })
      .from(rooms)
      .where(eq(rooms.roomTypeId, roomTypeId));

    const roomIds = roomsForType.map((r) => r.id);

    if (roomIds.length > 0) {
      const reservationsForRooms = await database
        .select({ reservationId: reservationRooms.reservationId })
        .from(reservationRooms)
        .where(inArray(reservationRooms.roomId, roomIds));

      const reservationIds = [
        ...new Set(reservationsForRooms.map((r) => r.reservationId)),
      ];

      if (reservationIds.length > 0) {
        await database
          .delete(reservations)
          .where(inArray(reservations.id, reservationIds));
      }

      await database.delete(rooms).where(inArray(rooms.id, roomIds));
    }

    await database.delete(roomRates).where(eq(roomRates.roomTypeId, roomTypeId));

    await database.delete(roomTypes).where(eq(roomTypes.id, roomTypeId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete room type", error);
    return NextResponse.json(
      { message: "Failed to delete room type." },
      { status: 500 },
    );
  }
}
