import { desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import {
    maintenanceRecords,
    serviceTickets,
    users,
} from "../db/schema";

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


// ============================================================
// TECHNICIAN - US-24 SERVICE TICKET MANAGEMENT
// ============================================================

// CESA-197 - Retrieve service tickets for technician
export async function getServiceTickets() {
    try {
        const tickets = await db
            .select()
            .from(serviceTickets)
            .orderBy(desc(serviceTickets.createdAt));

        return tickets;
    } catch (error) {
        console.error("Failed to retrieve service tickets:", error);
        throw new Error("Failed to retrieve service tickets");
    }
}


// CESA-200 - Retrieve one service ticket by ID
export async function getServiceTicketById(ticketId: string) {
    try {
        const [ticket] = await db
            .select()
            .from(serviceTickets)
            .where(eq(serviceTickets.id, ticketId))
            .limit(1);

        return ticket ?? null;
    } catch (error) {
        console.error("Failed to retrieve service ticket:", error);
        throw new Error("Failed to retrieve service ticket");
    }
}


// CESA-201 - Update service ticket status
export async function updateServiceTicketStatus(
    ticketId: string,
    status: "open" | "assigned" | "in_progress" | "resolved" | "closed"
) {
    try {
        const [updatedTicket] = await db
            .update(serviceTickets)
            .set({
                status,
                updatedAt: new Date(),
                resolvedAt: status === "resolved" ? new Date() : null,
            })
            .where(eq(serviceTickets.id, ticketId))
            .returning();

        return updatedTicket ?? null;
    } catch (error) {
        console.error("Failed to update service ticket status:", error);
        throw new Error("Failed to update service ticket status");
    }
}


// CESA-202 - Assign service ticket to technician
export async function assignServiceTicketTechnician(
    ticketId: string,
    technicianId: string
) {
    try {
        const [updatedTicket] = await db
            .update(serviceTickets)
            .set({
                assignedTechnicianId: technicianId,
                status: "assigned",
                updatedAt: new Date(),
            })
            .where(eq(serviceTickets.id, ticketId))
            .returning();

        return updatedTicket ?? null;
    } catch (error) {
        console.error("Failed to assign technician to service ticket:", error);
        throw new Error("Failed to assign technician to service ticket");
    }
}


// ============================================================
// TECHNICIAN - US-25 MAINTENANCE RECORDS
// ============================================================

// CESA-205 - Record diagnosis for a service ticket
export async function createMaintenanceDiagnosis(data: {
    id: string;
    ticketId: string;
    technicianId: string;
    diagnosis: string;
}) {
    try {
        const [record] = await db
            .insert(maintenanceRecords)
            .values({
                id: data.id,
                ticketId: data.ticketId,
                technicianId: data.technicianId,
                description: data.diagnosis,
            })
            .returning();

        return record;
    } catch (error) {
        console.error(
            "Failed to record maintenance diagnosis:",
            error
        );

        throw new Error(
            "Failed to record maintenance diagnosis"
        );
    }
}