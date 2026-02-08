import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  date,
  timestamp,
  numeric,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

/* ======================
   ENUMS
====================== */

export const userRoleEnum = pgEnum("user_role", ["ADMIN", "GUEST"]);

export const reservationStatusEnum = pgEnum("reservation_status", [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "CHECKED_OUT",
  "CANCELLED",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
]);

/* ======================
   USERS
====================== */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  role: userRoleEnum("role").default("GUEST"),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ======================
   ROOM TYPES
====================== */
export const roomTypes = pgTable("room_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  maxGuests: integer("max_guests").notNull(),
});

/* ======================
   ROOM TYPE IMAGES
====================== */
export const roomTypeImages = pgTable("room_type_images", {
  id: serial("id").primaryKey(),
  roomTypeId: integer("room_type_id")
    .references(() => roomTypes.id, { onDelete: "cascade" })
    .notNull(),
  imageUrl: text("image_url").notNull(),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ======================
   ROOMS
====================== */
export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  roomNumber: varchar("room_number", { length: 20 }).notNull().unique(),
  roomTypeId: integer("room_type_id")
    .references(() => roomTypes.id)
    .notNull(),
  isActive: boolean("is_active").default(true),
});

/* ======================
   ROOM IMAGES (optional)
====================== */
export const roomImages = pgTable("room_images", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id")
    .references(() => rooms.id, { onDelete: "cascade" })
    .notNull(),
  imageUrl: text("image_url").notNull(),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ======================
   ROOM RATES
====================== */
export const roomRates = pgTable("room_rates", {
  id: serial("id").primaryKey(),
  roomTypeId: integer("room_type_id")
    .references(() => roomTypes.id)
    .notNull(),
  pricePerNight: numeric("price_per_night", {
    precision: 10,
    scale: 2,
  }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
});

/* ======================
   RESERVATIONS
====================== */
export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  checkInDate: date("check_in_date").notNull(),
  checkOutDate: date("check_out_date").notNull(),
  status: reservationStatusEnum("status").default("PENDING"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ======================
   RESERVATION ROOMS
====================== */
export const reservationRooms = pgTable("reservation_rooms", {
  id: serial("id").primaryKey(),
  reservationId: integer("reservation_id")
    .references(() => reservations.id, { onDelete: "cascade" })
    .notNull(),
  roomId: integer("room_id")
    .references(() => rooms.id)
    .notNull(),
});

/* ======================
   PAYMENTS
====================== */
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  reservationId: integer("reservation_id")
    .references(() => reservations.id, { onDelete: "cascade" })
    .notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: paymentStatusEnum("status").default("PENDING"),
  paidAt: timestamp("paid_at"),
});
