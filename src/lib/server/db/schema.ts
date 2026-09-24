import { decimal, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
    "manager",
    "solar_owner",
    "household",
    "technician",
]);

export const memberStatusEnum = pgEnum("member_status", [
    "active",
    "pending",
    "inactive",
]);

export const offerStatusEnum = pgEnum("offer_status", [
    "pending",
    "approved",
    "rejected",
    "completed",
    "cancelled",
]);

export const requestStatusEnum = pgEnum("request_status", [
    "pending",
    "approved",
    "rejected",
    "fulfilled",
    "cancelled",
]);

export const ticketStatusEnum = pgEnum("ticket_status", [
    "open",
    "assigned",
    "in_progress",
    "resolved",
    "closed",
]);

export const ticketPriorityEnum = pgEnum("ticket_priority", [
    "critical",
    "high",
    "medium",
    "low",
]);

export const assetStatusEnum = pgEnum("asset_status", [
    "active",
    "inactive",
    "maintenance",
    "fault",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
    "energy",
    "maintenance",
    "request",
    "system",
    "announcement",
]);

export const users = pgTable("users", {
    id: text("id").primaryKey(), // Clerk User ID (e.g. user_2n...)
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    role: userRoleEnum("role").default("household").notNull(),
    status: memberStatusEnum("status").default("pending").notNull(),
    solarCapacityKw: decimal("solar_capacity_kw", { precision: 5, scale: 2 }),
    monthlyAllocationKwh: integer("monthly_allocation_kwh"),
    assignedGrid: text("assigned_grid"),
    avatarUrl: text("avatar_url"),
    phone: text("phone"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
