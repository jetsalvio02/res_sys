import React from "react";
import { redirect } from "next/navigation";
import AdminHeader from "./components/Admin_Header";
import AdminSidebar from "./components/Admin_Sidebar";
import { cookies } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const raw = cookieStore.get("session_user")?.value;

  if (!raw) {
    redirect("/users");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
