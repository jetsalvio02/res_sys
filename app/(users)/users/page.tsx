"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import UserNavbar from "./components/User_Navbar";

type RoomType = {
  id: number;
  name: string;
  description?: string | null;
  maxGuests?: number;
  image?: string | null;
};

export default function HomePage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

  useEffect(() => {
    const navbar = document.getElementById("navbar");

    const onScroll = () => {
      if (window.scrollY > 50) {
        navbar?.classList.add("scrolled");
      } else {
        navbar?.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", onScroll);

    const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      const anchor = e.currentTarget as HTMLAnchorElement | null;
      const href = anchor?.getAttribute("href");
      if (!href) return;
      const target = document.querySelector(href);
      if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    anchors.forEach((anchor) => {
      anchor.addEventListener("click", handleClick);
    });

    // Fetch room types
    fetch("/api/admin/room_types")
      .then((res) => res.json())
      .then(setRoomTypes);

    return () => {
      window.removeEventListener("scroll", onScroll);
      anchors.forEach((anchor) => {
        anchor.removeEventListener("click", handleClick);
      });
    };
  }, []);

  return (
    <>
      <UserNavbar />

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 -z-20">
          <img
            src="/hero-bg.jpg"
            alt="Hotel lobby"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200 rounded-full blur-[80px] opacity-30 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-300 rounded-full blur-[80px] opacity-20 -z-10"></div>

        <div className="relative max-w-[80rem] mx-auto px-6 text-center text-white">
          <h1 className="text-[3.5rem] md:text-6xl lg:text-7xl font-light mb-6 tracking-tight font-serif opacity-0 animate-slideUp">
            Stay In Style
            <br />
            Sleep In Comfort
          </h1>
          <p className="text-lg md:text-xl text-gray-100 font-light max-w-2xl mx-auto mb-10 opacity-0 animate-slideUp animate-delay-200">
            Discover thoughtfully designed rooms, seamless booking, and a calm space to
            unwind after your day.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-slideUp animate-delay-200">
            <a
              href="#rooms"
              className="px-8 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-sm font-semibold tracking-wide uppercase"
            >
              Browse Rooms
            </a>
            <Link
              href="#"
              className="px-8 py-3 rounded-full border border-white/60 text-sm font-semibold tracking-wide uppercase hover:bg-white hover:text-black transition-colors"
            >
              Explore A Suite
            </Link>
          </div>
        </div>
      </section>

      {/* Section 2 - Features / Room Types */}
      <section id="rooms" className="relative py-24 bg-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-amber-600 to-transparent"></div>

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-light mb-6 tracking-tight font-serif">
              Our Room Types
            </h2>
            <p className="text-lg text-gray-700 font-light max-w-2xl mx-auto leading-relaxed">
              Browse our available rooms and make a reservation instantly.
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            {roomTypes.map((room) => (
              <div
                key={room.id}
                className="border p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="h-48 mb-4 bg-gray-100 flex items-center justify-center text-6xl font-light text-gray-400 overflow-hidden">
                  <img
                    src={room.image ?? "/placeholder-room.jpg"}
                    alt={room.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-light mb-2 font-serif">
                  {room.name}
                </h3>
                <p className="text-gray-700 font-light mb-4">
                  {room.description ?? "No description available."}
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  Max Guests: {room.maxGuests ?? 1}
                </p>
                <div className="flex gap-3">
                  <a
                    href={`/room_types/${room.id}`}
                    className="flex-1 text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    View
                  </a>
                  <a
                    href={`/reserve/${room.id}`}
                    className="flex-1 text-center bg-amber-600 text-white py-2 rounded hover:bg-amber-700 transition-colors"
                  >
                    Reserve
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-400 py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm font-light">
            © 2026 Company. All rights reserved.
          </div>
          <div className="flex gap-8 text-sm font-light">
            <a href="#" className="hover:text-amber-600 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-amber-600 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-amber-600 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>

      {/* Animations */}
      <style jsx>{`
        @keyframes slideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 1.2s ease-out forwards;
        }
        .animate-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </>
  );
}
