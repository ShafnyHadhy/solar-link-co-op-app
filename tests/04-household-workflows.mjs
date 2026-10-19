// tests/04-household-workflows.mjs
// Suite 4: Household Dashboard, Energy Consumption Stats, Requests, Allocations, and Savings

import { BASE_URL, TEST_USERS, TestRunner } from "./test-utils.mjs";

export async function runHouseholdTests() {
    const runner = new TestRunner("Household Workflows");
    runner.printHeader();

    await runner.test("Household Dashboard: Consumption, clean energy share, and savings metrics", async () => {
        const res = await fetch(`${BASE_URL}/api/household/stats?householdId=${TEST_USERS.household}`, {
            headers: { "x-user-id": TEST_USERS.household }
        });
        const json = await res.json();
        const stats = json.data?.stats || json.stats || json.data;
        return (
            res.status === 200 &&
            json.success === true &&
            (typeof stats?.totalRequestedKwh === "number" ||
             typeof stats?.cleanEnergyUsedKwh === "number" ||
             typeof stats?.monthlyAllocationKwh === "number")
        );
    });

    await runner.test("Household Dashboard: Energy request history and status tracking", async () => {
        const res = await fetch(`${BASE_URL}/api/household/energy-requests?householdId=${TEST_USERS.household}`, {
            headers: { "x-user-id": TEST_USERS.household }
        });
        const json = await res.json();
        const requests = json.requests || json.data?.requests || json.data;
        return res.status === 200 && json.success === true && Array.isArray(requests);
    });

    await runner.test("Household Dashboard: Grid allocations, solar credits, and co-op savings", async () => {
        const res = await fetch(`${BASE_URL}/api/household/allocations?householdId=${TEST_USERS.household}`, {
            headers: { "x-user-id": TEST_USERS.household }
        });
        const json = await res.json();
        const allocations = json.allocations || json.data?.allocations || json.data;
        return res.status === 200 && json.success === true && Array.isArray(allocations);
    });

    await runner.test("Household Notifications: Allocation and approval notification feeds", async () => {
        const res = await fetch(`${BASE_URL}/api/notifications?userId=${TEST_USERS.household}`, {
            headers: { "x-user-id": TEST_USERS.household }
        });
        const json = await res.json();
        return res.status === 200 && json.success === true && Array.isArray(json.notifications);
    });

    return runner.printSummary();
}

if (process.argv[1]?.endsWith("04-household-workflows.mjs")) {
    runHouseholdTests().then(ok => process.exit(ok ? 0 : 1));
}
