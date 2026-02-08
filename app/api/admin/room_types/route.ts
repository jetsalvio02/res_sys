import { NextResponse } from "next/server";
import { roomTypes, roomTypeImages } from "@/lib/db/schema";
import { database } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { uploadImageFromBuffer } from "@/lib/cloudinary";

export async function POST(req: Request) {
  const formData = await req.formData();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const maxGuests = Number(formData.get("maxGuests"));
  const primaryIndex = Number(formData.get("primaryIndex"));
  const images = formData.getAll("images") as File[];

  if (!name || !maxGuests) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  /* 1️⃣ Create Room Type */
  const [roomType] = await database
    .insert(roomTypes)
    .values({
      name,
      description,
      maxGuests,
    })
    .returning();

  for (let i = 0; i < images.length; i++) {
    const file = images[i];
    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadImageFromBuffer(buffer, {
      folder: "room-types",
    });

    await database.insert(roomTypeImages).values({
      roomTypeId: roomType.id,
      imageUrl: result.secure_url,
      isPrimary: i === primaryIndex,
    });
  }

  return NextResponse.json({ success: true });
}

export async function GET() {
  const rows = await database
    .select({
      id: roomTypes.id,
      name: roomTypes.name,
      description: roomTypes.description,
      maxGuests: roomTypes.maxGuests,
      image: roomTypeImages.imageUrl,
    })
    .from(roomTypes)
    .leftJoin(
      roomTypeImages,
      and(
        eq(roomTypeImages.roomTypeId, roomTypes.id),
        eq(roomTypeImages.isPrimary, true),
      ),
    );

  return NextResponse.json(rows);
}
// export async function GET() {
//   // Get all active room types with primary image
//   const roomTypesData = await database.query.roomTypes.findMany({
//     with: {
//       images: true, // get images
//     },
//   });

//   const response = roomTypesData.map((rt) => {
//     const primaryImage = rt.images?.find((img) => img.isPrimary);
//     return {
//       id: rt.id,
//       name: rt.name,
//       description: rt.description,
//       maxGuests: rt.maxGuests,
//       imageUrl: primaryImage ? primaryImage.imageUrl : null,
//     };
//   });

//   return NextResponse.json(response);
// }

// export async function POST(req: Request) {
//   const { name, description, maxGuests } = await req.json();

//   const [created] = await database
//     .insert(roomTypes)
//     .values({ name, description, maxGuests })
//     .returning();

//   return NextResponse.json(created);
// }
