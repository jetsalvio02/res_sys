import { database } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const user_id = cookieStore.get("user_id")?.value;

  if (!user_id) {
    return NextResponse.json(null, { status: 401 });
  }

  const user = await database
    .select({ id: users.id, phone: users.phone })
    .from(users)
    .where(eq(users.id, Number(user_id)))
    .limit(1);

  if (!user.length) {
    return NextResponse.json(null, { status: 401 });
  }

  return NextResponse.json(user[0]);
}
