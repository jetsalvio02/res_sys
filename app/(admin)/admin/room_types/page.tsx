"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";

type RoomType = {
  id: number;
  name: string;
  description?: string | null;
  maxGuests?: number | null;
  image?: string | null;
};

export default function AdminRoomTypesPage() {
  const [data, setData] = useState<RoomType[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/room_types");
        const rows = await res.json();
        setData(rows);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* =====================
     DELETE HANDLER
  ===================== */

  const deleteRoomType = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setLoadingId(id);

    const res = await fetch(`/api/admin/room_types/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setData((prev) => prev.filter((rt) => rt.id !== id));
      Swal.fire({
        title: "Deleted!",
        text: "The room type has been deleted.",
        icon: "success",
      });
    } else {
      let message = "Failed to delete the room type.";
      try {
        const body = await res.json();
        if (body?.message) {
          message = body.message;
        }
      } catch {
        // ignore parse error
      }

      Swal.fire({
        title: "Error",
        text: message,
        icon: "error",
      });
    }

    setLoadingId(null);
  };

  const filtered = data.filter((rt) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const name = rt.name.toLowerCase();
    const desc = (rt.description ?? "").toLowerCase();
    return name.includes(q) || desc.includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Room Types</h1>
          <p className="text-sm text-gray-500">
            Manage all available room categories, images, and capacities.
          </p>
        </div>
        <Link
          href="/admin/room_types/new"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Room Type
        </Link>
      </div>

      {!loading && data.length > 0 && (
        <div className="flex flex-col gap-2 rounded-md border bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-gray-500">
            Showing {filtered.length} of {data.length} room types
          </div>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or description..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
        </div>
      )}

      {loading && (
        <p className="text-gray-500 text-sm">Loading room types...</p>
      )}

      {!loading && data.length === 0 && (
        <p className="text-gray-500 text-sm">No room types found.</p>
      )}

      {!loading && data.length > 0 && filtered.length === 0 && (
        <p className="text-gray-500 text-sm">
          No room types match your search.
        </p>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((rt) => (
            <div
              key={rt.id}
              className="group flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="h-40 w-full overflow-hidden bg-gray-100">
                <img
                  src={rt.image ?? "/placeholder-room.jpg"}
                  alt={rt.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold">{rt.name}</h3>
                  <span className="text-xs text-gray-400">#{rt.id}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {rt.description || "No description provided."}
                </p>
                <p className="mt-3 text-xs text-gray-500">
                  Max guests: {rt.maxGuests ?? "N/A"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/admin/room_types/${rt.id}/edit`}
                    className="inline-flex flex-1 items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-800 hover:bg-gray-100"
                  >
                    Edit Details
                  </Link>
                  {/* <Link
                    href={`/admin/room_types/${rt.id}/images`}
                    className="inline-flex flex-1 items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-800 hover:bg-gray-100"
                  >
                    Manage Images
                  </Link> */}
                  <button
                    onClick={() => deleteRoomType(rt.id)}
                    disabled={loadingId === rt.id}
                    className="inline-flex items-center justify-center rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {loadingId === rt.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
