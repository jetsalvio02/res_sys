"use client";

import { useEffect, useState } from "react";
import { BarChart, Users, FileText } from "lucide-react";
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
    total: string;
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/analytics");
        if (!res.ok) {
          return;
        }
        const json = (await res.json()) as AnalyticsData;
        setData(json);
      } catch {
        // ignore
      }
    };

    load();
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500 text-sm">Loading analytics...</p>
      </div>
    );
  }

  const reservationsByStatus = data.reservationsByStatus ?? [];
  const monthlyReservations = data.monthlyReservations ?? [];
  const monthlyNewUsers = data.monthlyNewUsers ?? [];

  const statusLabels = reservationsByStatus.map((s) => s.status);
  const statusCounts = reservationsByStatus.map((s) => s.count);

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
        backgroundColor: "rgba(56, 189, 248, 0.5)",
        borderColor: "rgba(56, 189, 248, 1)",
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
        borderColor: "rgba(129, 140, 248, 1)",
        backgroundColor: "rgba(129, 140, 248, 0.2)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#e5e7eb",
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
          callback: (value: string | number) =>
            Number(value).toFixed(0),
        },
        grid: {
          color: "rgba(55,65,81,0.4)",
        },
      },
    },
  } as const;

  const averageStay =
    data.totals.averageStayNights != null
      ? Number(data.totals.averageStayNights).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-slate-900 p-3">
            <BarChart className="text-blue-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Analytics Overview
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              Key performance metrics for your property
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Users" value={data.totals.users} icon={Users} />
        <StatCard
          label="Reservations"
          value={data.totals.reservations}
          icon={FileText}
        />
        <StatCard
          label="Active Reservations"
          value={data.totals.activeReservations}
          icon={FileText}
        />
        <StatCard
          label="Cancelled Reservations"
          value={data.totals.cancelledReservations}
          icon={FileText}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="New Users (This Month)"
          value={data.totals.newUsersThisMonth}
          icon={Users}
        />
        <StatCard
          label="Average Stay (Nights)"
          value={averageStay}
          icon={FileText}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl bg-slate-900 border border-slate-700 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white text-sm md:text-base">
              Reservations by Status
            </h2>
          </div>
          <div className="h-64 md:h-72">
            <Bar data={statusChartData} options={baseOptions} />
          </div>
        </div>

        <div className="rounded-xl bg-slate-900 border border-slate-700 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white text-sm md:text-base">
              New Users by Month
            </h2>
          </div>
          <div className="h-64 md:h-72">
            <Bar data={newUsersChartData} options={baseOptions} />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-slate-900 border border-slate-700 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white text-sm md:text-base">
            Monthly Reservations
          </h2>
        </div>
        <div className="h-64 md:h-80">
          <Line data={reservationsChartData} options={baseOptions} />
        </div>
      </div>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
};

function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs md:text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-xl md:text-2xl font-semibold text-slate-900">
          {value}
        </p>
      </div>
      <div className="rounded-full bg-slate-900/90 p-3">
        <Icon className="text-blue-400" />
      </div>
    </div>
  );
}
