import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import {
  reservations,
  reservationRooms,
  rooms,
  roomTypes,
  users,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const data = await database
    .select({
      id: reservations.id,
      roomType: roomTypes.name,
      checkInDate: reservations.checkInDate,
      checkOutDate: reservations.checkOutDate,
      status: reservations.status,
      guestName: users.fullName,
    })
    .from(reservations)
    .innerJoin(
      reservationRooms,
      eq(reservationRooms.reservationId, reservations.id),
    )
    .innerJoin(rooms, eq(rooms.id, reservationRooms.roomId))
    .innerJoin(roomTypes, eq(roomTypes.id, rooms.roomTypeId))
    .innerJoin(users, eq(users.id, reservations.userId));

  return NextResponse.json(data);
}

