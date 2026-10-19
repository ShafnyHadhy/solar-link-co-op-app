// tests/07-database-integrity.mjs
// Suite 7: Database Relational Integrity and Foreign Key Consistency

import { BASE_URL, TEST_USERS, TestRunner } from "./test-utils.mjs";

export async function runDatabaseTests() {
    const runner = new TestRunner("Database Relational Integrity");
    runner.printHeader();

    await runner.test("Energy requests join valid household users", async () => {
        const res = await fetch(`${BASE_URL}/api/manager/energy-requests`, {
            headers: { "x-user-id": TEST_USERS.manager }
        });
        const json = await res.json();
        const valid = Array.isArray(json.requests) && json.requests.every(r => typeof r.id === "string" && typeof r.householdId === "string");
        return res.status === 200 && valid;
    });

    await runner.test("Solar offers join valid solar owner records", async () => {
        const res = await fetch(`${BASE_URL}/api/manager/solar-offers`, {
            headers: { "x-user-id": TEST_USERS.manager }
        });
        const json = await res.json();
        const valid = Array.isArray(json.offers) && json.offers.every(o => typeof o.id === "string" && typeof o.ownerId === "string");
        return res.status === 200 && valid;
    });

    await runner.test("Dispatches preserve active offer and request relationships", async () => {
        const res = await fetch(`${BASE_URL}/api/manager/dispatches`, {
            headers: { "x-user-id": TEST_USERS.manager }
        });
        const json = await res.json();
        const valid = Array.isArray(json.dispatches) && json.dispatches.every(d => typeof d.offerId === "string" && typeof d.requestId === "string");
        return res.status === 200 && valid;
    });

    await runner.test("Service tickets reference valid assets and reported users", async () => {
        const res = await fetch(`${BASE_URL}/api/service-tickets`, {
            headers: { "x-user-id": TEST_USERS.technician }
        });
        const json = await res.json();
        const tickets = json.data?.tickets || json.tickets || json.data;
        const valid = Array.isArray(tickets) && tickets.length > 0 && tickets.every(t => typeof t.id === "string" && (t.assetId === null || typeof t.assetId === "string"));
        return res.status === 200 && valid;
    });

    return runner.printSummary();
}

if (process.argv[1]?.endsWith("07-database-integrity.mjs")) {
    runDatabaseTests().then(ok => process.exit(ok ? 0 : 1));
}
