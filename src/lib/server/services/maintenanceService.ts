
import { desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { serviceTickets, users } from "../db/schema";

export async function createServiceTicket(data: {
    id: string;
    reportedBy: string;
    assetId?: string;
    assignedTechnicianId?: string;
    title: string;
    description?: string;
    priority?: "critical" | "high" | "medium" | "low";
    status?: "open" | "assigned" | "in_progress" | "resolved" | "closed";
    location?: string;
}) {
    try {
        const result = await db
            .insert(serviceTickets)
            .values({
                id: data.id,
                reportedBy: data.reportedBy,
                assetId: data.assetId || null,
                assignedTechnicianId: data.assignedTechnicianId || null,
                title: data.title,
                description: data.description || null,
                priority: data.priority || "medium",
                status: data.status || "open",
                location: data.location || null,
            })
            .returning();

        return result[0];
    } catch (error) {
        console.error("Error creating service ticket in DB:", error);
        throw error;
    }
}

export async function getServiceTicketsByOwner(ownerId: string) {
    try {
        return await db
            .select({
                id: serviceTickets.id,
                reportedBy: serviceTickets.reportedBy,
                assetId: serviceTickets.assetId,
                assignedTechnicianId: serviceTickets.assignedTechnicianId,
                technicianName: users.name,
                title: serviceTickets.title,
                description: serviceTickets.description,
                priority: serviceTickets.priority,
                status: serviceTickets.status,
                location: serviceTickets.location,
                createdAt: serviceTickets.createdAt,
                updatedAt: serviceTickets.updatedAt,
            })
            .from(serviceTickets)
            .leftJoin(users, eq(serviceTickets.assignedTechnicianId, users.id))
            .where(eq(serviceTickets.reportedBy, ownerId))
            .orderBy(desc(serviceTickets.createdAt));
    } catch (error) {
        console.error("Error fetching service tickets by owner:", error);
        return [];
    }
}

export async function getAllServiceTickets() {
    try {
        return await db
            .select({
                id: serviceTickets.id,
                reportedBy: serviceTickets.reportedBy,
                reporterName: users.name,
                assetId: serviceTickets.assetId,
                assignedTechnicianId: serviceTickets.assignedTechnicianId,
                title: serviceTickets.title,
                description: serviceTickets.description,
                priority: serviceTickets.priority,
                status: serviceTickets.status,
                location: serviceTickets.location,
                createdAt: serviceTickets.createdAt,
                updatedAt: serviceTickets.updatedAt,
            })
            .from(serviceTickets)
            .leftJoin(users, eq(serviceTickets.reportedBy, users.id))
            .orderBy(desc(serviceTickets.createdAt));
    } catch (error) {
        console.error("Error fetching all service tickets:", error);
        return [];
    }
}