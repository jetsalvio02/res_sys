import axios from "axios";

// export type SessionUser = {
//   id: number;
//   role: "ADMIN" | "GUEST";
//   name: string;
// };

// export async function getSessionUser(): Promise<SessionUser | null> {
//   const cookieStore = await cookies();
//   const session = cookieStore.get("session_user");

//   if (!session) return null;

//   try {
//     return JSON.parse(session.value);
//   } catch {
//     return null;
//   }
// }

export async function Get_User() {
  if (typeof window === "undefined") return null;
  try {
    const response = await axios.get("/api/auth/me");
    if (!response) return null;
    return await response.data;
  } catch {
    return null;
  }
}

export async function Logout() {
  if (typeof window === "undefined") return null;
  try {
    await axios.post("/api/auth/logout");
  } catch {}
}
