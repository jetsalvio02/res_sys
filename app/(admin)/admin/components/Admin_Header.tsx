"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export default function AdminHeader() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/users");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="relative flex items-center px-4 sm:px-6 py-4">
        {/* LEFT – Hamburger */}
        <button
          // onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 rounded-lg bg-slate-900 text-white
                 hover:bg-slate-800 transition-colors"
          aria-label="Toggle menu"
        >
          {/* {isOpen ? <X size={20} /> : <Menu size={20} />} */}
        </button>

        {/* CENTER – Title */}
        <h1
          className="absolute left-1/2 -translate-x-1/2
                 text-xl sm:text-2xl font-bold text-slate-900
                 sm:static sm:translate-x-0"
        >
          Admin Dashboard
        </h1>

        {/* RIGHT – Logout */}
        <button
          onClick={logout}
          disabled={isLoading}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg
                 bg-red-600 text-white hover:bg-red-700
                 transition-colors duration-200
                 disabled:opacity-50 disabled:cursor-not-allowed
                 font-medium text-sm"
          aria-label="Logout"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">
            {isLoading ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
    </header>
  );
}
