// tests/05-technician-workflows.mjs
// Suite 5: Technician Service Tickets, Assignments, and Maintenance Operations

import { BASE_URL, TEST_USERS, TestRunner } from "./test-utils.mjs";

export async function runTechnicianTests() {
    const runner = new TestRunner("Technician Workflows");
    runner.printHeader();

    let sampleTicketId = null;

    await runner.test("Technician Dashboard: Service tickets queue and priority list", async () => {
        const res = await fetch(`${BASE_URL}/api/service-tickets`, {
            headers: { "x-user-id": TEST_USERS.technician }
        });
        const json = await res.json();
        const tickets = json.data?.tickets || json.tickets || json.data;
        if (Array.isArray(tickets) && tickets.length > 0) {
            sampleTicketId = tickets[0].id;
        }
        return res.status === 200 && json.success === true && Array.isArray(tickets);
    });

    await runner.test("Technician Dashboard: Maintenance records query by ticket", async () => {
        const ticketParam = sampleTicketId || "TEST-HIGH-1790627043504";
        const res = await fetch(`${BASE_URL}/api/maintenance-records?ticketId=${ticketParam}`, {
            headers: { "x-user-id": TEST_USERS.technician }
        });
        const json = await res.json();
        const records = json.data?.records || json.records || json.data;
        return res.status === 200 && json.success === true && Array.isArray(records);
    });

    await runner.test("Technician Notifications: Ticket assignment and urgent alerts", async () => {
        const res = await fetch(`${BASE_URL}/api/notifications?userId=${TEST_USERS.technician}`, {
            headers: { "x-user-id": TEST_USERS.technician }
        });
        const json = await res.json();
        return res.status === 200 && json.success === true && Array.isArray(json.notifications);
    });

    return runner.printSummary();
}

if (process.argv[1]?.endsWith("05-technician-workflows.mjs")) {
    runTechnicianTests().then(ok => process.exit(ok ? 0 : 1));
}
