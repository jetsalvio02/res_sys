import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { database } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function POST(req: Request) {
  const { name, email, phone, password } = await req.json();

  if (!name || !email || !phone || !password) {
    return NextResponse.json(
      { message: "All fields are required" },
      { status: 400 },
    );
  }

  const hashed = await bcrypt.hash(password, 10);

  await database.insert(users).values({
    fullName: name,
    email,
    phone,
    password: hashed,
    role: "GUEST",
  });

  return NextResponse.json({ message: "Registered successfully" });
}
