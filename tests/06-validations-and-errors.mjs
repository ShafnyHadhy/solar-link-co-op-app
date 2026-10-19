// tests/06-validations-and-errors.mjs
// Suite 6: Input Validation, Error Responses, and Edge Cases

import { BASE_URL, TEST_USERS, TestRunner } from "./test-utils.mjs";

export async function runValidationTests() {
    const runner = new TestRunner("Backend Validations & Error Handling");
    runner.printHeader();

    // 1. Dispatch Validations
    await runner.test("Dispatch rejects empty body with 400", async () => {
        const res = await fetch(`${BASE_URL}/api/dispatches`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-user-id": TEST_USERS.manager },
            body: JSON.stringify({})
        });
        return res.status === 400;
    });

    await runner.test("Dispatch rejects nonexistent offer ID with 404", async () => {
        const res = await fetch(`${BASE_URL}/api/dispatches`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-user-id": TEST_USERS.manager },
            body: JSON.stringify({
                offerId: "nonexistent_offer_999",
                requestId: "nonexistent_request_999",
                dispatchedEnergyKwh: 10
            })
        });
        return res.status === 404;
    });

    // 2. Solar Offer Validations
    await runner.test("Solar Offer rejects negative energyAmountKwh with 400", async () => {
        const res = await fetch(`${BASE_URL}/api/solar-offers`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-user-id": TEST_USERS.solar_owner },
            body: JSON.stringify({
                id: `off_test_${Date.now()}`,
                assetId: "test_asset",
                ownerId: TEST_USERS.solar_owner,
                energyAmountKwh: -25,
                minimumBatteryPercent: 50
            })
        });
        return res.status === 400;
    });

    await runner.test("Solar Offer rejects missing assetId/id with 400", async () => {
        const res = await fetch(`${BASE_URL}/api/solar-offers`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-user-id": TEST_USERS.solar_owner },
            body: JSON.stringify({
                ownerId: TEST_USERS.solar_owner,
                energyAmountKwh: 20
            })
        });
        return res.status === 400;
    });

    // 3. Household Request Validations
    await runner.test("Household energy request rejects missing requested amount with 400", async () => {
        const res = await fetch(`${BASE_URL}/api/household/energy-requests`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-user-id": TEST_USERS.household },
            body: JSON.stringify({
                householdId: TEST_USERS.household,
                reason: "AC unit cooling"
            })
        });
        return res.status === 400;
    });

    await runner.test("Household energy request rejects negative requested amount with 400", async () => {
        const res = await fetch(`${BASE_URL}/api/household/energy-requests`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-user-id": TEST_USERS.household },
            body: JSON.stringify({
                householdId: TEST_USERS.household,
                requestedEnergyKwh: -15
            })
        });
        return res.status === 400;
    });

    // 4. Member Management Validations
    await runner.test("Member update rejects invalid status with 400", async () => {
        const res = await fetch(`${BASE_URL}/api/users/update-status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "x-user-id": TEST_USERS.manager },
            body: JSON.stringify({
                userId: TEST_USERS.household,
                status: "non_existent_status_value"
            })
        });
        return res.status === 400;
    });

    await runner.test("Member update rejects invalid role with 400", async () => {
        const res = await fetch(`${BASE_URL}/api/users/update-role`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "x-user-id": TEST_USERS.manager },
            body: JSON.stringify({
                userId: TEST_USERS.household,
                role: "super_admin_king"
            })
        });
        return res.status === 400;
    });

    // 5. Service Ticket Validations
    await runner.test("Service ticket status rejects malformed body with 400/404", async () => {
        const res = await fetch(`${BASE_URL}/api/service-tickets/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "x-user-id": TEST_USERS.technician },
            body: JSON.stringify({ ticketId: "invalid_ticket_id", status: "invalid_status" })
        });
        return res.status === 400 || res.status === 404;
    });

    return runner.printSummary();
}

if (process.argv[1]?.endsWith("06-validations-and-errors.mjs")) {
    runValidationTests().then(ok => process.exit(ok ? 0 : 1));
}
