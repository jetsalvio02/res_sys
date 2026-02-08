"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

type AnalyticsData = {
  totals: {
    users: number;
    reservations: number;
    newUsersThisMonth: number;
    activeReservations: number;
    cancelledReservations: number;
    averageStayNights: number;
  };
  reservationsByStatus: {
    status: string;
    count: number;
  }[];
  monthlyRevenue: {
    month: string;
    total: number;
  }[];
  monthlyReservations: {
    month: string;
    count: number;
  }[];
  monthlyNewUsers: {
    month: string;
    count: number;
  }[];
};

type RecentReservation = {
  id: number;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  guestName: string;
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recent, setRecent] = useState<RecentReservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsRes, reservationsRes] = await Promise.all([
          fetch("/api/admin/analytics"),
          fetch("/api/admin/reservations"),
        ]);

        if (analyticsRes.ok) {
          const data = (await analyticsRes.json()) as AnalyticsData;
          setAnalytics(data);
        }

        if (reservationsRes.ok) {
          const data = (await reservationsRes.json()) as RecentReservation[];
          const sorted = [...data].sort((a, b) => b.id - a.id).slice(0, 5);
          setRecent(sorted);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totals = analytics?.totals;
  const reservationsByStatus = analytics?.reservationsByStatus ?? [];
  const monthlyReservations = analytics?.monthlyReservations ?? [];
  const monthlyNewUsers = analytics?.monthlyNewUsers ?? [];

  const statusLabels = reservationsByStatus.map((r) => r.status);
  const statusCounts = reservationsByStatus.map((r) => r.count);

  const newUserLabels = monthlyNewUsers.map((m) => m.month);
  const newUserCounts = monthlyNewUsers.map((m) => m.count);

  const reservationLabels = monthlyReservations.map((m) => m.month);
  const reservationCounts = monthlyReservations.map((m) => m.count);

  const statusChartData = {
    labels: statusLabels,
    datasets: [
      {
        label: "Reservations",
        data: statusCounts,
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const newUsersChartData = {
    labels: newUserLabels,
    datasets: [
      {
        label: "New Users",
        data: newUserCounts,
        backgroundColor: "rgba(244, 114, 182, 0.5)",
        borderColor: "rgba(244, 114, 182, 1)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const reservationsChartData = {
    labels: reservationLabels,
    datasets: [
      {
        label: "Reservations",
        data: reservationCounts,
        borderColor: "rgba(79, 70, 229, 1)",
        backgroundColor: "rgba(79, 70, 229, 0.2)",
        fill: true,
        tension: 0.3,
        pointRadius: 3,
      },
    ],
  };

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#4b5563",
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#9ca3af",
          font: {
            size: 10,
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          color: "#9ca3af",
          font: {
            size: 10,
          },
        },
        grid: {
          color: "rgba(209, 213, 219, 0.6)",
        },
      },
    },
  } as const;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-slate-900">
          Welcome back to your Dashboard
        </h2>
        <p className="text-slate-600 text-sm sm:text-base mt-2">
          Here&apos;s an overview of your property management system
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-xs sm:text-sm font-medium">
                Total Users
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                {totals ? totals.users : "—"}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Registered users in the system
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <span className="text-xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-xs sm:text-sm font-medium">
                Reservations
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                {totals ? totals.reservations : "—"}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                All-time reservations
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <span className="text-xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-xs sm:text-sm font-medium">
                Active Reservations
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                {totals
                  ? totals.activeReservations
                  : "—"}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Currently active stays
              </p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-lg">
              <span className="text-xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-xs sm:text-sm font-medium">
                Cancelled Reservations
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                {totals ? totals.cancelledReservations : "—"}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                All-time cancelled bookings
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <span className="text-xl">✨</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-xs sm:text-sm font-medium">
                New Users (This Month)
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                {totals ? totals.newUsersThisMonth : "—"}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Based on signup date
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <span className="text-xl">🆕</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-xs sm:text-sm font-medium">
                Average Stay (Nights)
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                {totals
                  ? Number(totals.averageStayNights).toFixed(1)
                  : "—"}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Average nights per reservation this year
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <span className="text-xl">🌙</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Reservations by Status
          </h2>
          {loading && (
            <p className="text-sm text-slate-500">Loading analytics...</p>
          )}
          {!loading && reservationsByStatus.length === 0 && (
            <p className="text-sm text-slate-500">No reservation data yet.</p>
          )}
          {!loading && reservationsByStatus.length > 0 && (
            <div className="h-64">
              <Bar data={statusChartData} options={baseOptions} />
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Recent Bookings
          </h2>
          {loading && (
            <p className="text-sm text-slate-500">Loading reservations...</p>
          )}
          {!loading && recent.length === 0 && (
            <p className="text-sm text-slate-500">No recent bookings.</p>
          )}
          {!loading && recent.length > 0 && (
            <div className="space-y-3">
              {recent.map((r) => (
                <div
                  key={r.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <p className="text-sm font-medium text-slate-900">
                    {r.roomType} #{r.id}
                  </p>
                  <p className="text-xs text-slate-600">{r.guestName}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {r.checkInDate} - {r.checkOutDate}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 capitalize">
                    {r.status.toLowerCase()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            New Users by Month
          </h2>
          {loading && (
            <p className="text-sm text-slate-500">Loading new user data...</p>
          )}
          {!loading && monthlyNewUsers.length === 0 && (
            <p className="text-sm text-slate-500">
              No new user data available yet.
            </p>
          )}
          {!loading && monthlyNewUsers.length > 0 && (
            <div className="h-64">
              <Bar data={newUsersChartData} options={baseOptions} />
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Monthly Reservations
          </h2>
          {loading && (
            <p className="text-sm text-slate-500">
              Loading reservation trend...
            </p>
          )}
          {!loading && monthlyReservations.length === 0 && (
            <p className="text-sm text-slate-500">
              No reservation trend data yet.
            </p>
          )}
          {!loading && monthlyReservations.length > 0 && (
            <div className="h-64">
              <Line data={reservationsChartData} options={baseOptions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
