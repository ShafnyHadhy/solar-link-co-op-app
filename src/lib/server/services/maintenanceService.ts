import { desc } from "drizzle-orm";
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