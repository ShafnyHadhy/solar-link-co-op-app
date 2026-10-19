// tests/03-solar-owner-workflows.mjs
// Suite 3: Solar Owner Dashboard, Assets, Offers, Sharing History, and Summary Analytics

import { BASE_URL, TEST_USERS, TestRunner } from "./test-utils.mjs";

export async function runSolarOwnerTests() {
    const runner = new TestRunner("Solar Owner Workflows");
    runner.printHeader();

    await runner.test("Solar Owner Dashboard: Fetch registered solar assets", async () => {
        const res = await fetch(`${BASE_URL}/api/solar-assets?ownerId=${TEST_USERS.solar_owner}`, {
            headers: { "x-user-id": TEST_USERS.solar_owner }
        });
        const json = await res.json();
        const assets = json.assets || json.data?.assets || json.data;
        return res.status === 200 && json.success === true && Array.isArray(assets);
    });

    await runner.test("Solar Owner Dashboard: Fetch active solar offers", async () => {
        const res = await fetch(`${BASE_URL}/api/solar-offers?ownerId=${TEST_USERS.solar_owner}`, {
            headers: { "x-user-id": TEST_USERS.solar_owner }
        });
        const json = await res.json();
        const offers = json.offers || json.data?.offers || json.data;
        return res.status === 200 && json.success === true && Array.isArray(offers);
    });

    await runner.test("Solar Owner Dashboard: Fetch sharing history & metrics summary", async () => {
        const res = await fetch(`${BASE_URL}/api/solar-offers/history?ownerId=${TEST_USERS.solar_owner}`, {
            headers: { "x-user-id": TEST_USERS.solar_owner }
        });
        const json = await res.json();
        const history = json.history || json.data?.history;
        const summary = json.summary || json.data?.summary;
        return (
            res.status === 200 &&
            json.success === true &&
            Array.isArray(history) &&
            typeof summary?.totalSharedKWh === "number" &&
            typeof summary?.totalCreditsEarned === "number"
        );
    });

    await runner.test("Solar Owner Notifications: Retrieve alerts and status notifications", async () => {
        const res = await fetch(`${BASE_URL}/api/notifications?userId=${TEST_USERS.solar_owner}`, {
            headers: { "x-user-id": TEST_USERS.solar_owner }
        });
        const json = await res.json();
        return res.status === 200 && json.success === true && Array.isArray(json.notifications);
    });

    return runner.printSummary();
}

if (process.argv[1]?.endsWith("03-solar-owner-workflows.mjs")) {
    runSolarOwnerTests().then(ok => process.exit(ok ? 0 : 1));
}
