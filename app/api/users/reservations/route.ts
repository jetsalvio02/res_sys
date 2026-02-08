import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { database } from "@/lib/db";
import {
  reservations,
  reservationRooms,
  rooms,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { roomTypeId, checkInDate, checkOutDate } = await req.json();

  if (!roomTypeId || !checkInDate || !checkOutDate) {
    return NextResponse.json(
      { message: "Missing reservation data" },
      { status: 400 },
    );
  }

  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return NextResponse.json(
      { message: "Invalid dates" },
      { status: 400 },
    );
  }

  if (start >= end) {
    return NextResponse.json(
      { message: "Check-out must be after check-in" },
      { status: 400 },
    );
  }

  const roomsForType = await database
    .select()
    .from(rooms)
    .where(eq(rooms.roomTypeId, Number(roomTypeId)));

  let room = roomsForType[0];

  if (!room) {
    const [created] = await database
      .insert(rooms)
      .values({
        roomNumber: `RT-${roomTypeId}-1`,
        roomTypeId: Number(roomTypeId),
      })
      .returning();

    room = created;
  }

  const [reservation] = await database
    .insert(reservations)
    .values({
      userId: Number(userId),
      checkInDate,
      checkOutDate,
    })
    .returning();

  await database.insert(reservationRooms).values({
    reservationId: reservation.id,
    roomId: room.id,
  });

  return NextResponse.json(reservation, { status: 201 });
}
