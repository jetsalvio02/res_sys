"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";

type Reservation = {
  id: number;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  totalAmount: string | null;
  roomType: string;
  image?: string | null;
};

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    const loadReservations = async () => {
      try {
        const res = await fetch("/api/users/reservations/me");

        if (res.status === 401) {
          setReservations([]);
          return;
        }

        if (!res.ok) {
          setReservations([]);
          return;
        }

        const data: Reservation[] = await res.json();
        setReservations(data);
      } finally {
        setLoading(false);
      }
    };

    loadReservations();
  }, []);



const cancelReservation = async (id: number) => {
  const result = await Swal.fire({
    title: "Cancel reservation?",
    text: "Are you sure you want to cancel this reservation?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, cancel it",
    cancelButtonText: "No, keep it",
    confirmButtonColor: "#d33",
  });

  if (!result.isConfirmed) return;

  setCancellingId(id);

  try {
    const res = await fetch(`/api/users/reservations/${id}`, {
      method: "PATCH",
    });

    if (!res.ok) {
      let message = "Failed to cancel reservation.";

      try {
        const body = await res.json();
        if (body?.message) message = body.message;
      } catch {}

      await Swal.fire({
        title: "Oops!",
        text: message,
        icon: "error",
      });

      return;
    }

    setReservations((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "CANCELLED",
            }
          : r,
      ),
    );

    await Swal.fire({
      title: "Cancelled",
      text: "Your reservation has been cancelled.",
      icon: "success",
    });
  } finally {
    setCancellingId(null);
  }
};


  return (
    <main className="min-h-screen bg-gray-50 pt-28 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-light font-serif mb-1">
              My Reservations
            </h1>
            <p className="text-gray-600 text-sm">
              Review upcoming stays, past visits, and manage your bookings.
            </p>
          </div>
          <Link
            href="/#rooms"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Book another stay
          </Link>
        </div>

        {loading && (
          <div className="text-center text-gray-500 py-20">
            Loading reservations...
          </div>
        )}

        {!loading && reservations.length === 0 && (
          <div className="bg-white border rounded-2xl p-10 text-center shadow-sm">
            <p className="text-gray-600 mb-4">
              You don’t have any reservations yet.
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Start by exploring our room types and picking your dates.
            </p>
            <Link
              href="/#rooms"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              Browse Rooms
            </Link>
          </div>
        )}

        <div className="grid gap-6">
          {reservations.map((r) => {
            const canCancel =
              r.status === "PENDING" || r.status === "CONFIRMED";

            const statusClasses =
              r.status === "CONFIRMED"
                ? "bg-emerald-100 text-emerald-700"
                : r.status === "PENDING"
                ? "bg-amber-100 text-amber-700"
                : r.status === "CANCELLED"
                ? "bg-red-100 text-red-700"
                : "bg-slate-100 text-slate-700";

            const checkIn = new Date(r.checkInDate);
            const checkOut = new Date(r.checkOutDate);
            const nights =
              !Number.isNaN(checkIn.getTime()) &&
              !Number.isNaN(checkOut.getTime())
                ? Math.max(
                    1,
                    Math.round(
                      (checkOut.getTime() - checkIn.getTime()) /
                        (1000 * 60 * 60 * 24),
                    ),
                  )
                : null;

            return (
              <div
                key={r.id}
                className="bg-white border rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
                  <div className="w-full md:w-40 h-32 md:h-28 rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={r.image ?? "/placeholder-room.jpg"}
                      alt={r.roomType}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="text-lg font-serif mb-1">
                          {r.roomType}
                        </h2>
                        <p className="text-xs text-gray-500">
                          Reservation #{r.id}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusClasses}`}
                      >
                        {r.status.toLowerCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600">
                      <div>
                        <p className="uppercase tracking-wide text-[10px] text-gray-400">
                          Check-in
                        </p>
                        <p>{r.checkInDate}</p>
                      </div>
                      <div>
                        <p className="uppercase tracking-wide text-[10px] text-gray-400">
                          Check-out
                        </p>
                        <p>{r.checkOutDate}</p>
                      </div>
                      <div>
                        <p className="uppercase tracking-wide text-[10px] text-gray-400">
                          Nights
                        </p>
                        <p>{nights ?? "—"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-3 min-w-[170px]">
                    <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">
                        Total
                      </p>
                      <p className="text-lg font-semibold">
                        {r.totalAmount
                          ? `₱${Number(r.totalAmount).toLocaleString()}`
                          : "—"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Link
                        href={`/reservations/${r.id}`}
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-100"
                      >
                        View details
                      </Link>
                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => cancelReservation(r.id)}
                          disabled={cancellingId === r.id}
                          className="inline-flex items-center justify-center rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {cancellingId === r.id
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
