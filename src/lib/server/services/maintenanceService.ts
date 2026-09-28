import { desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { serviceTickets } from "../db/schema";

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

export async function updateServiceTicketStatus(
    ticketId: string,
    status:
        | "open"
        | "assigned"
        | "in_progress"
        | "resolved"
        | "closed"
) {
    try {
        const [updatedTicket] = await db
            .update(serviceTickets)
            .set({
                status,
                updatedAt: new Date(),
                resolvedAt:
                    status === "resolved"
                        ? new Date()
                        : null,
            })
            .where(eq(serviceTickets.id, ticketId))
            .returning();

        return updatedTicket ?? null;
    } catch (error) {
        console.error(
            "Failed to update service ticket status:",
            error
        );

        throw new Error(
            "Failed to update service ticket status"
        );
    }
}