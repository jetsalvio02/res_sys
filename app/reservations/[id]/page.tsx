"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import UserNavbar from "@/app/(users)/users/components/User_Navbar";

type Reservation = {
  id: number;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  totalAmount: string | null;
  roomType: string;
};

export default function ReservationDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/users/reservations/me");

        if (res.status === 401) {
          setError("Please log in to view this reservation.");
          setReservation(null);
          return;
        }

        if (!res.ok) {
          setError("Failed to load reservation.");
          setReservation(null);
          return;
        }

        const list = (await res.json()) as Reservation[];
        const found = list.find((r) => r.id === Number(id)) ?? null;

        if (!found) {
          setError("Reservation not found.");
          setReservation(null);
          return;
        }

        setReservation(found);
      } catch {
        setError("Failed to load reservation.");
        setReservation(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  return (
    <>
      <UserNavbar />

      <main className="min-h-screen bg-gray-50 pt-28 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-light font-serif mb-2">
              Reservation Details
            </h1>
            <p className="text-gray-600 text-sm">
              Review the details of your reservation.
            </p>
          </div>

          {loading && (
            <div className="text-center text-gray-500 py-20">
              Loading reservation...
            </div>
          )}

          {!loading && error && (
            <div className="bg-white border rounded-lg p-8 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Link
                href="/users/reservations"
                className="inline-block text-sm text-blue-600 hover:underline"
              >
                Back to My Reservations
              </Link>
            </div>
          )}

          {!loading && !error && reservation && (
            <div className="bg-white border rounded-lg p-8 space-y-4">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-serif mb-1">
                    {reservation.roomType}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Reservation #{reservation.id}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full capitalize
                    ${
                      reservation.status === "CONFIRMED"
                        ? "bg-emerald-100 text-emerald-700"
                        : ""
                    }
                    ${
                      reservation.status === "PENDING"
                        ? "bg-amber-100 text-amber-700"
                        : ""
                    }
                    ${
                      reservation.status === "CANCELLED"
                        ? "bg-red-100 text-red-700"
                        : ""
                    }
                    ${
                      reservation.status === "CHECKED_IN"
                        ? "bg-blue-100 text-blue-700"
                        : ""
                    }
                    ${
                      reservation.status === "CHECKED_OUT"
                        ? "bg-slate-100 text-slate-700"
                        : ""
                    }
                  `}
                >
                  {reservation.status.toLowerCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Check-in
                  </p>
                  <p className="text-sm text-gray-800">
                    {reservation.checkInDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Check-out
                  </p>
                  <p className="text-sm text-gray-800">
                    {reservation.checkOutDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Total Amount
                  </p>
                  <p className="text-sm text-gray-800">
                    {reservation.totalAmount
                      ? `₱${Number(
                          reservation.totalAmount,
                        ).toLocaleString()}`
                      : "Not set"}
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/users/reservations"
                  className="inline-block text-sm text-blue-600 hover:underline"
                >
                  Back to My Reservations
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
