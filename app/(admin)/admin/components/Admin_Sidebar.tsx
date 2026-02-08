"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  DoorOpen,
  Home,
  FileText,
  CreditCard,
  Menu,
  X,
  BarChart3,
} from "lucide-react";
import { useState } from "react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/room_types", label: "Room Types", icon: DoorOpen },
    // { href: "/admin/rooms", label: "Rooms", icon: Home },
    { href: "/admin/reservations", label: "Reservations", icon: FileText },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative w-64 h-screen lg:h-auto bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700 p-6 transition-transform duration-300 z-40 lg:z-auto transform ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo / Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard size={28} className="text-blue-400" />
            Admin
          </h2>
          <p className="text-slate-400 text-sm mt-1">Management Panel</p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  active
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-6 left-6 right-6 pt-6 border-t border-slate-700">
          <p className="text-xs text-slate-500">Admin Dashboard v1.0</p>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-white bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
