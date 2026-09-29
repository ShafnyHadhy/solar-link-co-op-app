/**
 * Seed Script — Inserts realistic data into Neon DB for the Solar Owner.
 *
 * This script:
 *  1. Finds the first solar_owner user from the DB
 *  2. Creates a solar asset for them (if not exists)
 *  3. Inserts a realistic energy reading (so surplus calculation works)
 *
 * Usage:  node seed-data.mjs
 */

import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function seed() {
    await client.connect();
    console.log('✅ Connected to Neon DB\n');

    // 1. Find the solar_owner user
    const usersRes = await client.query(`SELECT id, name, email, role FROM users WHERE role = 'solar_owner' LIMIT 5`);

    if (usersRes.rows.length === 0) {
        console.log('❌ No solar_owner user found. Open the app first so Clerk syncs your user.');
        await client.end();
        return;
    }

    console.log('📋 Solar Owner Users Found:');
    usersRes.rows.forEach((u, i) => console.log(`   ${i + 1}. ${u.name} (${u.email}) — ID: ${u.id}`));

    const owner = usersRes.rows[0];
    console.log(`\n🎯 Seeding data for: ${owner.name} (${owner.id})\n`);

    // 2. Create solar asset (upsert — skip if exists)
    const ASSET_ID = `asset_${owner.id.slice(-8)}`;

    const existingAsset = await client.query(`SELECT id FROM solar_assets WHERE owner_id = $1 LIMIT 1`, [owner.id]);

    let assetId;
    if (existingAsset.rows.length > 0) {
        assetId = existingAsset.rows[0].id;
        console.log(`🔆 Solar asset already exists: ${assetId}`);
    } else {
        await client.query(`
            INSERT INTO solar_assets (id, owner_id, asset_type, name, capacity_kw, status, location, installed_at, created_at, updated_at)
            VALUES ($1, $2, 'solar_panel', 'Home Solar System', 6.00, 'active', 'Main Roof', '2024-08-10T00:00:00Z', NOW(), NOW())
        `, [ASSET_ID, owner.id]);
        assetId = ASSET_ID;
        console.log(`🔆 Created solar asset: ${assetId}`);
    }

    // 3. Insert energy reading with realistic values
    const READING_ID = `reading_${Date.now()}`;
    await client.query(`
        INSERT INTO energy_readings (id, asset_id, reading_time, generation_kwh, consumption_kwh, battery_level_percent, created_at)
        VALUES ($1, $2, NOW(), 28.400, 12.600, 84.00, NOW())
    `, [READING_ID, assetId]);
    console.log(`⚡ Created energy reading: gen=28.4 kWh, con=12.6 kWh, battery=84%`);
    console.log(`   → Surplus = 28.4 - 12.6 = 15.8 kWh`);

    // 4. Verify surplus API will work
    const readingCheck = await client.query(`
        SELECT generation_kwh, consumption_kwh, battery_level_percent
        FROM energy_readings
        WHERE asset_id = $1
        ORDER BY reading_time DESC
        LIMIT 1
    `, [assetId]);

    if (readingCheck.rows.length > 0) {
        const r = readingCheck.rows[0];
        const surplus = (Number(r.generation_kwh) - Number(r.consumption_kwh)).toFixed(1);
        console.log(`\n✅ Verification — Latest reading:`);
        console.log(`   Generation:  ${r.generation_kwh} kWh`);
        console.log(`   Consumption: ${r.consumption_kwh} kWh`);
        console.log(`   Surplus:     ${surplus} kWh`);
        console.log(`   Battery:     ${r.battery_level_percent}%`);
    }

    console.log(`\n🎉 Seed complete! Your dashboard will now show real data.\n`);

    await client.end();
}

seed().catch((err) => {
    console.error('💥 Seed failed:', err);
    process.exit(1);
});
