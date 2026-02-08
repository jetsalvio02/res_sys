import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { database } from "@/lib/db";
import {
  reservations,
  reservationRooms,
  rooms,
  roomTypes,
  roomTypeImages,
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const data = await database
    .select({
      id: reservations.id,
      checkInDate: reservations.checkInDate,
      checkOutDate: reservations.checkOutDate,
      status: reservations.status,
      totalAmount: reservations.totalAmount,
      roomType: roomTypes.name,
      image: roomTypeImages.imageUrl,
    })
    .from(reservations)
    .innerJoin(
      reservationRooms,
      eq(reservationRooms.reservationId, reservations.id),
    )
    .innerJoin(rooms, eq(rooms.id, reservationRooms.roomId))
    .innerJoin(roomTypes, eq(roomTypes.id, rooms.roomTypeId))
    .leftJoin(
      roomTypeImages,
      and(
        eq(roomTypeImages.roomTypeId, roomTypes.id),
        eq(roomTypeImages.isPrimary, true),
      ),
    )
    .where(eq(reservations.userId, Number(userId)));

  return NextResponse.json(data);
}
