import { desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import {
    maintenanceRecords,
    serviceTickets,
    solarAssets,
    users,
} from "../db/schema";
import { createNotification } from "./notificationService";

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

        const ticket = result[0];

        // 1. Notify assigned technician if assigned at creation (US-18)
        if (ticket.assignedTechnicianId) {
            try {
                await createNotification({
                    userId: ticket.assignedTechnicianId,
                    type: "maintenance",
                    title: "Service Ticket Assigned",
                    message: `You have been assigned to service ticket "${ticket.title}".`,
                });
            } catch (notifErr) {
                console.error("[Maintenance] Failed to notify assigned technician:", notifErr);
            }
        }

        // 2. Notify managers if important maintenance issue reported (US-18)
        if (ticket.priority === "critical" || ticket.priority === "high") {
            try {
                const managerUsers = await db
                    .select({ id: users.id })
                    .from(users)
                    .where(eq(users.role, "manager"));

                for (const manager of managerUsers) {
                    await createNotification({
                        userId: manager.id,
                        type: "maintenance",
                        title: "Urgent Maintenance Reported",
                        message: `A ${ticket.priority} priority maintenance issue has been reported: "${ticket.title}".`,
                    });
                }
            } catch (notifErr) {
                console.error("[Maintenance] Failed to notify managers of urgent ticket:", notifErr);
            }
        }

        return ticket;
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


// CESA-201 / CESA-260 - Update service ticket status
export async function updateServiceTicketStatus(
    ticketId: string,
    status: "open" | "assigned" | "in_progress" | "resolved" | "closed"
) {
    try {
        // CESA-260 - Update ticket status
        const updateData: {
            status: "open" | "assigned" | "in_progress" | "resolved" | "closed";
            updatedAt: Date;
            resolvedAt?: Date;
        } = {
            status,
            updatedAt: new Date(),
        };

        // Set resolution time when maintenance is completed.
        // Do not erase it when the resolved ticket is later closed.
        if (status === "resolved") {
            updateData.resolvedAt = new Date();
        }

        const [updatedTicket] = await db
            .update(serviceTickets)
            .set(updateData)
            .where(eq(serviceTickets.id, ticketId))
            .returning();

        // Notify reporter and asset owner if ticket was resolved (US-18)
        if (updatedTicket && status === "resolved") {
            try {
                const recipients = new Set<string>();
                if (updatedTicket.reportedBy) {
                    recipients.add(updatedTicket.reportedBy);
                }
                if (updatedTicket.assetId) {
                    const [asset] = await db
                        .select({ ownerId: solarAssets.ownerId })
                        .from(solarAssets)
                        .where(eq(solarAssets.id, updatedTicket.assetId))
                        .limit(1);

                    if (asset?.ownerId) {
                        recipients.add(asset.ownerId);
                    }
                }

                for (const recipientId of recipients) {
                    await createNotification({
                        userId: recipientId,
                        type: "maintenance",
                        title: "Service Ticket Resolved",
                        message: `Your service ticket "${updatedTicket.title}" has been resolved.`,
                    });
                }
            } catch (notifErr) {
                console.error("[Maintenance] Failed to notify reporter/owner of resolved ticket:", notifErr);
            }
        }

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

        // Notify assigned technician upon assignment (US-18)
        if (updatedTicket) {
            try {
                await createNotification({
                    userId: technicianId,
                    type: "maintenance",
                    title: "Service Ticket Assigned",
                    message: `You have been assigned to service ticket "${updatedTicket.title}".`,
                });
            } catch (notifErr) {
                console.error("[Maintenance] Failed to notify assigned technician:", notifErr);
            }
        }

        return updatedTicket ?? null;
    } catch (error) {
        console.error("Failed to assign technician to service ticket:", error);
        throw new Error("Failed to assign technician to service ticket");
    }
}


// ============================================================
// TECHNICIAN - US-31 COMPLETE MAINTENANCE WORKFLOW
// ============================================================

// CESA-253 - Retrieve tickets assigned to technician
export async function getAssignedServiceTickets(
    technicianId: string
) {
    try {
        const tickets = await db
            .select()
            .from(serviceTickets)
            .where(
                eq(
                    serviceTickets.assignedTechnicianId,
                    technicianId
                )
            )
            .orderBy(desc(serviceTickets.createdAt));

        return tickets;
    } catch (error) {
        console.error(
            "Failed to retrieve assigned service tickets:",
            error
        );

        throw new Error(
            "Failed to retrieve assigned service tickets"
        );
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


// CESA-255 - Update maintenance diagnosis
export async function updateMaintenanceDiagnosis(
    recordId: string,
    diagnosis: string
) {
    try {
        const [updatedRecord] = await db
            .update(maintenanceRecords)
            .set({
                description: diagnosis,
            })
            .where(eq(maintenanceRecords.id, recordId))
            .returning();

        return updatedRecord ?? null;
    } catch (error) {
        console.error(
            "Failed to update maintenance diagnosis:",
            error
        );

        throw new Error(
            "Failed to update maintenance diagnosis"
        );
    }
}


// CESA-206 - Record replaced parts
export async function updateMaintenanceParts(
    recordId: string,
    partsUsed: string
) {
    try {
        const [record] = await db
            .update(maintenanceRecords)
            .set({
                partsUsed,
            })
            .where(eq(maintenanceRecords.id, recordId))
            .returning();

        return record ?? null;
    } catch (error) {
        console.error(
            "Failed to record replaced parts:",
            error
        );
        throw new Error(
            "Failed to record replaced parts"
        );
    }
}


// CESA-207 - Record maintenance notes
export async function updateMaintenanceNotes(
    recordId: string,
    notes: string
) {
    try {
        const [record] = await db
            .update(maintenanceRecords)
            .set({
                notes,
            })
            .where(eq(maintenanceRecords.id, recordId))
            .returning();

        return record ?? null;
    } catch (error) {
        console.error(
            "Failed to record maintenance notes:",
            error
        );
        throw new Error(
            "Failed to record maintenance notes"
        );
    }
}


// CESA-209 - Retrieve maintenance history for a service ticket
export async function getMaintenanceHistory(
    ticketId: string
) {
    try {
        const records = await db
            .select()
            .from(maintenanceRecords)
            .where(
                eq(
                    maintenanceRecords.ticketId,
                    ticketId
                )
            )
            .orderBy(
                desc(
                    maintenanceRecords.maintenanceDate
                )
            );

        return records;
    } catch (error) {
        console.error(
            "Failed to retrieve maintenance history:",
            error
        );
        throw new Error(
            "Failed to retrieve maintenance history"
        );
    }
}