"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthModal from "@/app/(auth)/components/Auth_Modal";
import { Get_User, Logout } from "@/lib/auth"; // adjust path if needed

type Mode = "login" | "register";

type SessionUser = {
  id: number;
  phone?: string | null;
} | null;

export default function UserNavbar() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<Mode>("login");
  const [user, setUser] = useState<SessionUser>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Check user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const data = await Get_User();
      setUser(data);
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await Logout();
    setUser(null); // update UI immediately
  };

  return (
    <>
      <nav
        id="navbar"
        className="fixed top-0 left-0 w-full z-50 border-b px-6 py-4 flex items-center bg-transparent backdrop-blur transition-all duration-300"
      >
        {/* Center links */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6">
          <Link href="/">Home</Link>
          <a href="#rooms">Rooms</a>
          <Link href="/users/reservations">My Reservations</Link>
        </div>

        {/* Right buttons */}
        <div className="ml-auto flex gap-4">
          {!loading &&
            (user ? (
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setIsAuthOpen(true);
                  }}
                  className="hover:text-blue-600"
                >
                  Login
                </button>

                <button
                  onClick={() => {
                    setAuthMode("register");
                    setIsAuthOpen(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Register
                </button>
              </>
            ))}
        </div>
      </nav>

      <style jsx>{`
        #navbar {
          transition: background-color 0.3s ease, box-shadow 0.3s ease,
            backdrop-filter 0.3s ease;
        }
        #navbar.scrolled {
          background-color: rgba(255, 255, 255, 0.95);
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.15);
          backdrop-filter: blur(16px);
        }
      `}</style>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        intialMode={authMode}
      />
    </>
  );
}
