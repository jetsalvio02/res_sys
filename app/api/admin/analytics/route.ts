import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { users, reservations } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    /* =========================
       TOTAL COUNTS
    ========================= */

    const [totalUsers] = await database
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const [totalReservations] = await database
      .select({ count: sql<number>`count(*)` })
      .from(reservations);

    /* =========================
       RESERVATIONS BY STATUS
    ========================= */

    const reservationStatusStats = await database.execute<{
      status: string;
      count: number;
    }>(sql`
      SELECT status, COUNT(*)::int AS count
      FROM reservations
      GROUP BY status
    `);

    /* =========================
       TOTAL / MONTHLY REVENUE
       (FROM RESERVATIONS)
    ========================= */

    const totalRevenueResult = await database.execute<{
      total: string;
    }>(sql`
      SELECT COALESCE(SUM(total_amount), 0)::numeric AS total
      FROM reservations
      WHERE status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT')
    `);

    const totalRevenue = Number(totalRevenueResult.rows[0].total);

    const monthlyRevenue = await database.execute<{
      month: string;
      total: string;
    }>(sql`
      SELECT 
        TO_CHAR(check_in_date, 'Mon') AS month,
        SUM(total_amount)::numeric AS total
      FROM reservations
      WHERE status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT')
        AND EXTRACT(YEAR FROM check_in_date) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY month, EXTRACT(MONTH FROM check_in_date)
      ORDER BY EXTRACT(MONTH FROM check_in_date)
    `);

    /* =========================
       MONTHLY RESERVATIONS
    ========================= */

    const monthlyReservations = await database.execute<{
      month: string;
      count: number;
    }>(sql`
      SELECT 
        TO_CHAR(created_at, 'Mon') AS month,
        COUNT(*)::int AS count
      FROM reservations
      WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY month, EXTRACT(MONTH FROM created_at)
      ORDER BY EXTRACT(MONTH FROM created_at)
    `);

    /* =========================
       ACTIVE / CANCELLED COUNTS
    ========================= */

    const activeReservationsResult = await database.execute<{
      count: number;
    }>(sql`
      SELECT COUNT(*)::int AS count
      FROM reservations
      WHERE status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
    `);

    const cancelledReservationsResult = await database.execute<{
      count: number;
    }>(sql`
      SELECT COUNT(*)::int AS count
      FROM reservations
      WHERE status = 'CANCELLED'
    `);

    const activeReservations = activeReservationsResult.rows[0].count;
    const cancelledReservations = cancelledReservationsResult.rows[0].count;

    /* =========================
       NEW USERS THIS MONTH
    ========================= */

    const newUsersThisMonthResult = await database.execute<{
      count: number;
    }>(sql`
      SELECT COUNT(*)::int AS count
      FROM users
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `);

    const newUsersThisMonth = newUsersThisMonthResult.rows[0].count;

    /* =========================
       MONTHLY NEW USERS
    ========================= */

    const monthlyNewUsers = await database.execute<{
      month: string;
      count: number;
    }>(sql`
      SELECT 
        TO_CHAR(created_at, 'Mon') AS month,
        COUNT(*)::int AS count
      FROM users
      WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY month, EXTRACT(MONTH FROM created_at)
      ORDER BY EXTRACT(MONTH FROM created_at)
    `);

    /* =========================
       AVERAGE STAY LENGTH
    ========================= */

    const averageStayResult = await database.execute<{
      avg: string;
    }>(sql`
      SELECT 
        COALESCE(AVG(check_out_date - check_in_date), 0)::numeric AS avg
      FROM reservations
      WHERE EXTRACT(YEAR FROM check_in_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);

    const averageStayNights = Number(averageStayResult.rows[0].avg);

    return NextResponse.json({
      totals: {
        users: totalUsers.count,
        reservations: totalReservations.count,
        revenue: totalRevenue,
        newUsersThisMonth,
        activeReservations,
        cancelledReservations,
        averageStayNights,
      },
      reservationsByStatus: reservationStatusStats.rows,
      monthlyRevenue: monthlyRevenue.rows.map((r) => ({
        month: r.month,
        total: Number(r.total),
      })),
      monthlyReservations: monthlyReservations.rows,
      monthlyNewUsers: monthlyNewUsers.rows,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 },
    );
  }
}
