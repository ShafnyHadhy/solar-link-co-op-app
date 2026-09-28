/**
 * ========================================================
 *  Solar-Link Co-Op — Backend CRUD Integration Test Script
 * ========================================================
 *
 * Tests all Solar Owner API routes against the running Expo dev server:
 *
 *   1. User Sync          (POST create + GET fetch + POST update)
 *   2. Solar Assets       (POST create + GET list + GET by ID + PUT update)
 *   3. Energy Surplus      (GET surplus calculation)
 *   4. Solar Offers        (POST create + GET list + PATCH cancel)
 *
 * Usage:
 *   node test-backend.mjs
 *
 * Make sure `npx expo` is running before executing this.
 */

const BASE = "http://localhost:8081/api";

// ─── Helpers ───────────────────────────────────────────────

let passed = 0;
let failed = 0;

function uid() {
    return "test_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

async function test(name, fn) {
    try {
        await fn();
        passed++;
        console.log(`  ✅ ${name}`);
    } catch (err) {
        failed++;
        console.log(`  ❌ ${name}`);
        console.log(`     → ${err.message}`);
    }
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

async function fetchJSON(url, options = {}) {
    const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    const json = await res.json();
    return { status: res.status, ...json };
}

// ─── Test Data ─────────────────────────────────────────────

const TEST_USER_ID = uid();
const TEST_ASSET_ID = uid();
const TEST_OFFER_ID = uid();

// ═══════════════════════════════════════════════════════════
//  1. USER SYNC
// ═══════════════════════════════════════════════════════════

async function testUserSync() {
    console.log("\n📋 1. USER SYNC TESTS");

    // Create user
    await test("POST /api/users/sync — create new solar owner", async () => {
        const res = await fetchJSON(`${BASE}/users/sync`, {
            method: "POST",
            body: JSON.stringify({
                id: TEST_USER_ID,
                name: "Test Solar Owner",
                email: `${TEST_USER_ID}@test.com`,
                role: "solar_owner",
            }),
        });
        assert(res.success === true, `Expected success, got: ${JSON.stringify(res)}`);
        assert(res.data.action === "created", `Expected action=created, got: ${res.data.action}`);
        assert(res.data.user.role === "solar_owner", `Expected role=solar_owner`);
    });

    // Fetch user
    await test("GET /api/users/sync?userId=... — fetch user by ID", async () => {
        const res = await fetchJSON(`${BASE}/users/sync?userId=${TEST_USER_ID}`);
        assert(res.success === true, `Expected success`);
        assert(res.data.user.id === TEST_USER_ID, `User ID mismatch`);
        assert(res.data.user.name === "Test Solar Owner", `Name mismatch`);
    });

    // Update user
    await test("POST /api/users/sync — update existing user name", async () => {
        const res = await fetchJSON(`${BASE}/users/sync`, {
            method: "POST",
            body: JSON.stringify({
                id: TEST_USER_ID,
                name: "Updated Solar Owner",
                email: `${TEST_USER_ID}@test.com`,
            }),
        });
        assert(res.success === true, `Expected success`);
        assert(res.data.action === "updated", `Expected action=updated`);
        assert(res.data.user.name === "Updated Solar Owner", `Name not updated`);
    });

    // Validation
    await test("POST /api/users/sync — reject missing required fields", async () => {
        const res = await fetchJSON(`${BASE}/users/sync`, {
            method: "POST",
            body: JSON.stringify({ id: "x" }),
        });
        assert(res.success === false, `Expected failure for missing fields`);
    });
}

// ═══════════════════════════════════════════════════════════
//  2. SOLAR ASSET MANAGEMENT (US-04A)
// ═══════════════════════════════════════════════════════════

async function testSolarAssets() {
    console.log("\n🔆 2. SOLAR ASSET MANAGEMENT TESTS");

    // POST — Create asset
    await test("POST /api/solar-assets — create 'Home Solar System'", async () => {
        const res = await fetchJSON(`${BASE}/solar-assets`, {
            method: "POST",
            body: JSON.stringify({
                id: TEST_ASSET_ID,
                ownerId: TEST_USER_ID,
                assetType: "solar_panel",
                name: "Home Solar System",
                capacityKw: "5.00",
                status: "active",
                location: "Main Roof",
                installedAt: "2026-08-20T00:00:00.000Z",
            }),
        });
        assert(res.success === true, `Expected success, got: ${JSON.stringify(res)}`);
        assert(res.asset.name === "Home Solar System", `Name mismatch`);
        assert(res.asset.status === "active", `Status should be active`);
        assert(res.asset.assetType === "solar_panel", `assetType mismatch`);
        assert(res.asset.location === "Main Roof", `location mismatch`);
    });

    // GET — List assets by owner
    await test("GET /api/solar-assets?ownerId=... — list owner's assets", async () => {
        const res = await fetchJSON(`${BASE}/solar-assets?ownerId=${TEST_USER_ID}`);
        assert(res.success === true, `Expected success`);
        assert(Array.isArray(res.assets), `Expected assets array`);
        assert(res.assets.length >= 1, `Expected at least 1 asset`);
        assert(res.assets[0].name === "Home Solar System", `First asset name mismatch`);
    });

    // GET — Single asset by ID
    await test("GET /api/solar-assets/:id — get asset by ID", async () => {
        const res = await fetchJSON(`${BASE}/solar-assets/${TEST_ASSET_ID}`);
        assert(res.success === true, `Expected success, got: ${JSON.stringify(res)}`);
        assert(res.asset.id === TEST_ASSET_ID, `Asset ID mismatch`);
        assert(res.asset.capacityKw === "5.00", `Capacity mismatch`);
    });

    // PUT — Update asset
    await test("PUT /api/solar-assets/:id — update name and status", async () => {
        const res = await fetchJSON(`${BASE}/solar-assets/${TEST_ASSET_ID}`, {
            method: "PUT",
            body: JSON.stringify({
                name: "Updated Solar System",
                status: "maintenance",
                location: "East Roof",
            }),
        });
        assert(res.success === true, `Expected success, got: ${JSON.stringify(res)}`);
        assert(res.asset.name === "Updated Solar System", `Name not updated`);
        assert(res.asset.status === "maintenance", `Status not updated`);
        assert(res.asset.location === "East Roof", `Location not updated`);
    });

    // PUT — Not found
    await test("PUT /api/solar-assets/:id — 404 for non-existent asset", async () => {
        const res = await fetchJSON(`${BASE}/solar-assets/non_existent_id`, {
            method: "PUT",
            body: JSON.stringify({ name: "Nope" }),
        });
        assert(res.error !== undefined, `Expected error for non-existent asset`);
    });

    // GET — Not found
    await test("GET /api/solar-assets/:id — 404 for non-existent asset", async () => {
        const res = await fetchJSON(`${BASE}/solar-assets/non_existent_id`);
        assert(res.error !== undefined, `Expected error for non-existent asset`);
    });

    // POST — Validation
    await test("POST /api/solar-assets — reject missing required fields", async () => {
        const res = await fetchJSON(`${BASE}/solar-assets`, {
            method: "POST",
            body: JSON.stringify({ id: "x" }),
        });
        assert(res.error !== undefined, `Expected error for missing fields`);
    });

    // PUT — Restore back to active for later tests
    await test("PUT /api/solar-assets/:id — restore status to active", async () => {
        const res = await fetchJSON(`${BASE}/solar-assets/${TEST_ASSET_ID}`, {
            method: "PUT",
            body: JSON.stringify({
                name: "Home Solar System",
                status: "active",
            }),
        });
        assert(res.success === true, `Expected success`);
        assert(res.asset.status === "active", `Status not restored`);
    });
}

// ═══════════════════════════════════════════════════════════
//  3. ENERGY SURPLUS (US-04B)
// ═══════════════════════════════════════════════════════════

async function testEnergySurplus() {
    console.log("\n⚡ 3. ENERGY SURPLUS TESTS");

    // Surplus for test asset (no readings → zeros)
    await test("GET /api/energy-surplus?assetId=... — surplus with no readings", async () => {
        const res = await fetchJSON(`${BASE}/energy-surplus?assetId=${TEST_ASSET_ID}`);
        assert(res.success === true, `Expected success, got: ${JSON.stringify(res)}`);
        assert(res.data.surplus.generationKwh === 0, `Expected 0 generation`);
        assert(res.data.surplus.consumptionKwh === 0, `Expected 0 consumption`);
        assert(res.data.surplus.surplusKwh === 0, `Expected 0 surplus`);
    });

    // Validation
    await test("GET /api/energy-surplus — reject missing assetId", async () => {
        const res = await fetchJSON(`${BASE}/energy-surplus`);
        assert(res.success === false, `Expected failure for missing assetId`);
    });
}

// ═══════════════════════════════════════════════════════════
//  4. SOLAR OFFERS (US-04B)
// ═══════════════════════════════════════════════════════════

async function testSolarOffers() {
    console.log("\n🤝 4. SOLAR OFFER TESTS");

    // POST — Should fail: surplus is 0, can't offer energy
    await test("POST /api/solar-offers — reject when surplus is 0", async () => {
        const res = await fetchJSON(`${BASE}/solar-offers`, {
            method: "POST",
            body: JSON.stringify({
                id: TEST_OFFER_ID,
                ownerId: TEST_USER_ID,
                assetId: TEST_ASSET_ID,
                energyAmountKwh: 5.0,
                minimumBatteryPercent: 40,
            }),
        });
        assert(res.success === false, `Expected failure — no surplus available`);
    });

    // GET — List offers (should be empty)
    await test("GET /api/solar-offers?ownerId=... — list offers (empty)", async () => {
        const res = await fetchJSON(`${BASE}/solar-offers?ownerId=${TEST_USER_ID}`);
        assert(res.success === true, `Expected success`);
        assert(Array.isArray(res.data.offers), `Expected offers array`);
        assert(res.data.offers.length === 0, `Expected 0 offers`);
    });

    // Validation — missing ownerId
    await test("GET /api/solar-offers — reject missing ownerId", async () => {
        const res = await fetchJSON(`${BASE}/solar-offers`);
        assert(res.success === false, `Expected failure`);
    });

    // Cancel — not found
    await test("PATCH /api/solar-offers/:id/cancel — 404 non-existent offer", async () => {
        const res = await fetchJSON(`${BASE}/solar-offers/non_existent/cancel`, {
            method: "PATCH",
        });
        assert(res.success === false, `Expected failure`);
    });
}

// ═══════════════════════════════════════════════════════════
//  RUN ALL TESTS
// ═══════════════════════════════════════════════════════════

async function main() {
    console.log("╔══════════════════════════════════════════════════╗");
    console.log("║  Solar-Link Co-Op — Backend CRUD Test Suite      ║");
    console.log("║  Solar Owner Module (US-04A + US-04B)            ║");
    console.log("╚══════════════════════════════════════════════════╝");
    console.log(`  Server:     ${BASE}`);
    console.log(`  Test User:  ${TEST_USER_ID}`);
    console.log(`  Test Asset: ${TEST_ASSET_ID}`);

    await testUserSync();
    await testSolarAssets();
    await testEnergySurplus();
    await testSolarOffers();

    console.log("\n══════════════════════════════════════════════════");
    console.log(`  Results: ${passed} passed, ${failed} failed`);
    console.log("══════════════════════════════════════════════════\n");

    if (failed > 0) process.exit(1);
}

main().catch((err) => {
    console.error("\n💥 Test runner crashed:", err);
    process.exit(1);
});
