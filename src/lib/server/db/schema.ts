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


export const solarAssets = pgTable("solar_assets", {
    id: text("id").primaryKey(),

    ownerId: text("owner_id")
        .notNull()
        .references(() => users.id),

    assetType: text("asset_type").notNull(),

    name: text("name").notNull(),

    capacityKw: decimal("capacity_kw", {
        precision: 8,
        scale: 2,
    }),

    status: assetStatusEnum("status")
        .default("active")
        .notNull(),

    location: text("location"),

    installedAt: timestamp("installed_at"),

    createdAt: timestamp("created_at")
        .defaultNow()
        .notNull(),

    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull(),
});

export const energyReadings = pgTable("energy_readings", {
    id: text("id").primaryKey(),

    assetId: text("asset_id")
        .notNull()
        .references(() => solarAssets.id),

    readingTime: timestamp("reading_time")
        .notNull(),

    generationKwh: decimal("generation_kwh", {
        precision: 10,
        scale: 3,
    }),

    consumptionKwh: decimal("consumption_kwh", {
        precision: 10,
        scale: 3,
    }),

    batteryLevelPercent: decimal("battery_level_percent", {
        precision: 5,
        scale: 2,
    }),

    createdAt: timestamp("created_at")
        .defaultNow()
        .notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type SolarAsset = typeof solarAssets.$inferSelect;
export type NewSolarAsset = typeof solarAssets.$inferInsert;

export type EnergyReading = typeof energyReadings.$inferSelect;
export type NewEnergyReading = typeof energyReadings.$inferInsert;
