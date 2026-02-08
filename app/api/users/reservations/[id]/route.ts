import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { database } from "@/lib/db";
import {
  reservations,
  reservationRooms,
  rooms,
  roomTypes,
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const reservationId = Number(id);

  if (!reservationId) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const rows = await database
    .select({
      id: reservations.id,
      checkInDate: reservations.checkInDate,
      checkOutDate: reservations.checkOutDate,
      status: reservations.status,
      totalAmount: reservations.totalAmount,
      roomType: roomTypes.name,
    })
    .from(reservations)
    .innerJoin(
      reservationRooms,
      eq(reservationRooms.reservationId, reservations.id),
    )
    .innerJoin(rooms, eq(rooms.id, reservationRooms.roomId))
    .innerJoin(roomTypes, eq(roomTypes.id, rooms.roomTypeId))
    .where(
      and(
        eq(reservations.userId, Number(userId)),
        eq(reservations.id, reservationId),
      ),
    );

  const reservation = rows[0];

  if (!reservation) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(reservation);
}

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const reservationId = Number(id);

  if (!reservationId) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const rows = await database
    .select({
      id: reservations.id,
      status: reservations.status,
    })
    .from(reservations)
    .where(
      and(
        eq(reservations.userId, Number(userId)),
        eq(reservations.id, reservationId),
      ),
    );

  const reservation = rows[0];

  if (!reservation) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  if (
    reservation.status === "CHECKED_IN" ||
    reservation.status === "CHECKED_OUT"
  ) {
    return NextResponse.json(
      { message: "You cannot cancel a stay that has already started." },
      { status: 400 },
    );
  }

  if (reservation.status === "CANCELLED") {
    return NextResponse.json(
      { message: "This reservation is already cancelled." },
      { status: 400 },
    );
  }

  await database
    .update(reservations)
    .set({ status: "CANCELLED" })
    .where(
      and(
        eq(reservations.userId, Number(userId)),
        eq(reservations.id, reservationId),
      ),
    );

  return NextResponse.json({ success: true });
}

