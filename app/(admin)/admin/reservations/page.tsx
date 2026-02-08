"use client";

import { useEffect, useState } from "react";

type Reservation = {
  id: number;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  guestName: string;
};

function calculateNights(checkInDate: string, checkOutDate: string) {
  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "-";
  }

  const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

  if (!Number.isFinite(diff) || diff <= 0) {
    return "-";
  }

  return diff;
}

function formatStatus(status: string) {
  return status.toLowerCase().replace("_", " ");
}

function statusClass(status: string) {
  if (status === "CONFIRMED") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "PENDING") {
    return "bg-amber-50 text-amber-700";
  }

  if (status === "CANCELLED") {
    return "bg-red-50 text-red-700";
  }

  if (status === "CHECKED_IN") {
    return "bg-blue-50 text-blue-700";
  }

  if (status === "CHECKED_OUT") {
    return "bg-slate-100 text-slate-700";
  }

  return "bg-slate-100 text-slate-700";
}

export default function AdminReservationsPage() {
  const [data, setData] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/reservations");

        if (!res.ok) {
          setData([]);
          return;
        }

        const json = (await res.json()) as Reservation[];
        setData(json);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500 text-sm">Loading reservations...</p>
      </div>
    );
  }

  const total = data.length;
  const active = data.filter((r) =>
    ["PENDING", "CONFIRMED", "CHECKED_IN"].includes(r.status),
  ).length;
  const cancelled = data.filter((r) => r.status === "CANCELLED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Reservations
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Overview of all guest stays and booking statuses
          </p>
        </div>

        {data.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs md:text-sm">
            <span className="rounded-full bg-white border border-slate-200 px-3 py-1 text-slate-600">
              Total{" "}
              <span className="font-semibold text-slate-900">{total}</span>
            </span>
            <span className="rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-emerald-700">
              Active{" "}
              <span className="font-semibold text-emerald-900">{active}</span>
            </span>
            <span className="rounded-full bg-red-50 border border-red-100 px-3 py-1 text-red-700">
              Cancelled{" "}
              <span className="font-semibold text-red-900">{cancelled}</span>
            </span>
          </div>
        )}
      </div>

      {data.length === 0 && (
        <p className="text-slate-500 text-sm">No reservations found.</p>
      )}

      {data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-400">Reservation</p>
                  <p className="text-sm md:text-base font-semibold text-slate-900">
                    #{r.id} • {r.roomType}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full ${statusClass(
                    r.status,
                  )}`}
                >
                  {formatStatus(r.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 text-xs md:text-sm text-slate-500 mt-2 sm:grid-cols-3">
                <div>
                  <p className="font-medium text-slate-700">Guest</p>
                  <p className="mt-0.5">{r.guestName}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Stay dates</p>
                  <p className="mt-0.5">
                    {r.checkInDate} → {r.checkOutDate}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Nights</p>
                  <p className="mt-0.5">
                    {calculateNights(r.checkInDate, r.checkOutDate)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
