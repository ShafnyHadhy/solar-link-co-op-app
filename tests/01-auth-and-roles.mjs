// tests/01-auth-and-roles.mjs
// Suite 1: Authentication & Role-Based Authorization Matrix

import { BASE_URL, TEST_USERS, TestRunner } from "./test-utils.mjs";

export async function runAuthTests() {
    const runner = new TestRunner("Authentication & Role Authorization");
    runner.printHeader();

    // 1. Unauthenticated Requests Blocked
    await runner.test("Unauthenticated access to Manager API returns 401", async () => {
        const res = await fetch(`${BASE_URL}/api/manager/energy-requests`);
        return res.status === 401;
    });

    await runner.test("Unauthenticated access to Solar Owner API returns 401", async () => {
        const res = await fetch(`${BASE_URL}/api/solar-offers`);
        return res.status === 401;
    });

    await runner.test("Unauthenticated access to Household API returns 401", async () => {
        const res = await fetch(`${BASE_URL}/api/household/energy-requests`);
        return res.status === 401;
    });

    await runner.test("Unauthenticated access to Technician API returns 401", async () => {
        const res = await fetch(`${BASE_URL}/api/maintenance-records?ticketId=TEST-HIGH-1790627043504`);
        return res.status === 401;
    });

    await runner.test("Unauthenticated access to Notifications API returns 401", async () => {
        const res = await fetch(`${BASE_URL}/api/notifications`);
        return res.status === 401;
    });

    // 2. Unknown User Blocked
    await runner.test("Valid Clerk ID not present in DB returns 404", async () => {
        const res = await fetch(`${BASE_URL}/api/manager/energy-requests`, {
            headers: { "x-user-id": TEST_USERS.ghost }
        });
        return res.status === 404;
    });

    // 3. Manager Role Authorization Boundaries
    await runner.test("Manager can access Manager endpoints (200)", async () => {
        const res = await fetch(`${BASE_URL}/api/manager/energy-requests`, {
            headers: { "x-user-id": TEST_USERS.manager }
        });
        return res.status === 200;
    });

    await runner.test("Manager blocked from private Solar Owner endpoints (403)", async () => {
        const res = await fetch(`${BASE_URL}/api/solar-offers?ownerId=${TEST_USERS.solar_owner}`, {
            headers: { "x-user-id": TEST_USERS.manager }
        });
        return res.status === 403;
    });

    await runner.test("Manager blocked from private Household endpoints (403)", async () => {
        const res = await fetch(`${BASE_URL}/api/household/energy-requests?householdId=${TEST_USERS.household}`, {
            headers: { "x-user-id": TEST_USERS.manager }
        });
        return res.status === 403;
    });

    await runner.test("Manager blocked from private Technician endpoints (403)", async () => {
        const res = await fetch(`${BASE_URL}/api/maintenance-records?ticketId=TEST`, {
            headers: { "x-user-id": TEST_USERS.manager }
        });
        return res.status === 403;
    });

    // 4. Cross-Role Privilege Escalation Prevention
    await runner.test("Solar Owner blocked from Manager endpoints (403)", async () => {
        const res = await fetch(`${BASE_URL}/api/manager/energy-requests`, {
            headers: { "x-user-id": TEST_USERS.solar_owner }
        });
        return res.status === 403;
    });

    await runner.test("Household blocked from Manager endpoints (403)", async () => {
        const res = await fetch(`${BASE_URL}/api/manager/energy-requests`, {
            headers: { "x-user-id": TEST_USERS.household }
        });
        return res.status === 403;
    });

    await runner.test("Technician blocked from Manager endpoints (403)", async () => {
        const res = await fetch(`${BASE_URL}/api/manager/energy-requests`, {
            headers: { "x-user-id": TEST_USERS.technician }
        });
        return res.status === 403;
    });

    return runner.printSummary();
}

if (process.argv[1]?.endsWith("01-auth-and-roles.mjs")) {
    runAuthTests().then(ok => process.exit(ok ? 0 : 1));
}
