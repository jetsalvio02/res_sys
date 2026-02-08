import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { database } from "@/lib/db";
import { users } from "@/lib/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const result = await database
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = result[0];

  if (!user) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 },
    );
  }

  const is_match = await bcrypt.compare(password, user.password);

  if (!is_match) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    message: "Login successfully",
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });

  response.cookies.set(
    "session_user",
    JSON.stringify({ id: user.id, role: user.role }),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    },
  );

  response.cookies.set("user_id", String(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return response;

  // Replace with DB validation
  // const isAdmin = email === "admin@test.com";

  // const cookieStore = await cookies();

  // cookieStore.set(
  //   "session",
  //   JSON.stringify({
  //     id: 1,
  //     role: isAdmin ? "ADMIN" : "GUEST",
  //     name: "User",
  //   }),
  //   {
  //     httpOnly: true,
  //     path: "/",
  //   },
  // );

  return NextResponse.json({ success: true });
}
