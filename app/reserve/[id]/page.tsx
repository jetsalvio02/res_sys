"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import UserNavbar from "@/app/(users)/users/components/User_Navbar";

type RoomType = {
  id: number;
  name: string;
  description?: string | null;
  maxGuests: number;
};

export default function ReserveRoomPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/admin/room_types/${id}`);

        if (!res.ok) {
          throw new Error("Failed to load room type");
        }

        const data = await res.json();
        const rt = Array.isArray(data) ? data[0] : data;

        setRoomType(rt ?? null);
      } catch {
        setError("Failed to load room type");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!checkInDate || !checkOutDate) {
      setError("Please select both check-in and check-out dates.");
      return;
    }

    if (checkInDate >= checkOutDate) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    if (!id) {
      setError("Missing room type.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/users/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomTypeId: Number(id),
          checkInDate,
          checkOutDate,
        }),
      });

      if (res.status === 401) {
        setError("Please log in to make a reservation.");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message ?? "Failed to create reservation.");
        return;
      }

      router.push("/users/reservations");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <UserNavbar />

      <main className="min-h-screen bg-gray-50 pt-28 px-6">
        <div className="max-w-xl mx-auto">
          {loading && (
            <p className="text-gray-500 text-center py-20">
              Loading reservation form...
            </p>
          )}

          {!loading && error && !roomType && (
            <p className="text-red-600 text-center py-20">{error}</p>
          )}

          {!loading && roomType && (
            <div className="space-y-6 bg-white border rounded-lg p-6 shadow-sm">
              <h1 className="text-2xl font-serif font-light">
                Reserve {roomType.name}
              </h1>
              <p className="text-gray-600 text-sm">
                Max guests: {roomType.maxGuests}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Check-in
                    </label>
                    <input
                      type="date"
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Check-out
                    </label>
                    <input
                      type="date"
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 mt-2">{error}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-60 transition-colors"
                  >
                    {submitting ? "Reserving..." : "Confirm Reservation"}
                  </button>
                  <Link
                    href={`/room_types/${roomType.id}`}
                    className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-sm"
                  >
                    Back
                  </Link>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
