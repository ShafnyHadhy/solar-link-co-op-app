// tests/02-manager-workflows.mjs
// Suite 2: Manager Dashboard, Energy Requests, Solar Offers, Dispatches, and Members

import { BASE_URL, TEST_USERS, TestRunner } from "./test-utils.mjs";

export async function runManagerTests() {
    const runner = new TestRunner("Manager Operations & Console");
    runner.printHeader();

    let liveReserveKwh = 0;

    await runner.test("Manager Dashboard: Energy Generation feed", async () => {
        const res = await fetch(`${BASE_URL}/api/manager/energy-generation`, {
            headers: { "x-user-id": TEST_USERS.manager }
        });
        const json = await res.json();
        const kwh = json.data?.generatedTodayKwh ?? json.generatedTodayKwh;
        return res.status === 200 && json.success === true && typeof kwh === "number";
    });

    await runner.test("Manager Dashboard: Energy Allocation feed", async () => {
        const res = await fetch(`${BASE_URL}/api/manager/energy-allocation`, {
            headers: { "x-user-id": TEST_USERS.manager }
        });
        const json = await res.json();
        const kwh = json.data?.allocatedTodayKwh ?? json.allocatedTodayKwh;
        return res.status === 200 && json.success === true && typeof kwh === "number";
    });

    await runner.test("Manager Dashboard: Community Reserve API", async () => {
        const res = await fetch(`${BASE_URL}/api/manager/solar-offers?view=reserve`, {
            headers: { "x-user-id": TEST_USERS.manager }
        });
        const json = await res.json();
        liveReserveKwh = json.data?.availableReserveKwh ?? json.availableReserveKwh;
        return res.status === 200 && json.success === true && typeof liveReserveKwh === "number" && liveReserveKwh >= 0;
    });

    await runner.test("Manager Requests: Energy requests list with status counts", async () => {
        const res = await fetch(`${BASE_URL}/api/manager/energy-requests`, {
            headers: { "x-user-id": TEST_USERS.manager }
        });
        const json = await res.json();
        return res.status === 200 && json.success === true && Array.isArray(json.requests);
    });

    await runner.test("Manager Offers: Solar offers list & live Available Energy verification", async () => {
        const res = await fetch(`${BASE_URL}/api/manager/solar-offers`, {
            headers: { "x-user-id": TEST_USERS.manager }
        });
        const json = await res.json();
        const approvedSum = (json.offers || [])
            .filter(o => o.status === 'approved' && (!o.expiresAt || new Date(o.expiresAt).getTime() > Date.now()) && ((o.remainingEnergyKwh ?? 0) > 0.001))
            .reduce((sum, o) => sum + (o.remainingEnergyKwh ?? 0), 0);
        return res.status === 200 && json.success === true && Math.abs(approvedSum - liveReserveKwh) < 0.5;
    });

    await runner.test("Manager Dispatches: Retrieve dispatch execution audit history", async () => {
        const res = await fetch(`${BASE_URL}/api/manager/dispatches`, {
            headers: { "x-user-id": TEST_USERS.manager }
        });
        const json = await res.json();
        return res.status === 200 && json.success === true && Array.isArray(json.dispatches);
    });

    await runner.test("Manager Members: Retrieve member directory with statuses and roles", async () => {
        const res = await fetch(`${BASE_URL}/api/users`, {
            headers: { "x-user-id": TEST_USERS.manager }
        });
        const json = await res.json();
        return res.status === 200 && json.success === true && Array.isArray(json.members) && json.members.length > 0;
    });

    await runner.test("Manager Notifications: Notification inbox and alert queries", async () => {
        const res = await fetch(`${BASE_URL}/api/notifications?userId=${TEST_USERS.manager}`, {
            headers: { "x-user-id": TEST_USERS.manager }
        });
        const json = await res.json();
        return res.status === 200 && json.success === true && Array.isArray(json.notifications);
    });

    return runner.printSummary();
}

if (process.argv[1]?.endsWith("02-manager-workflows.mjs")) {
    runManagerTests().then(ok => process.exit(ok ? 0 : 1));
}
