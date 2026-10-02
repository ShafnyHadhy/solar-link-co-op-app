// Energy Readings API Route
// GET  /api/energy-readings?assetId=...
// POST /api/energy-readings

import { db } from "@/lib/server/db/client";
import { energyReadings } from "@/lib/server/db/schema";
import { recordEnergyReading } from "@/lib/server/services/energyService";
import { BadRequestError } from "@/lib/server/utils/errors";
import { errorResponse, successResponse } from "@/lib/server/utils/response";
import { desc, eq } from "drizzle-orm";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const assetId = url.searchParams.get("assetId");
        const limit = Number(url.searchParams.get("limit") || 50);

        let query = db.select().from(energyReadings).$dynamic();

        if (assetId) {
            query = query.where(eq(energyReadings.assetId, assetId));
        }

        const readings = await query
            .orderBy(desc(energyReadings.readingTime))
            .limit(limit);

        return successResponse({ readings });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { assetId, readingTime, generationKwh, consumptionKwh, batteryLevelPercent } = body;

        if (!assetId) {
            throw new BadRequestError("assetId is required");
        }

        if (generationKwh === undefined || generationKwh === null) {
            throw new BadRequestError("generationKwh is required");
        }

        const reading = await recordEnergyReading({
            assetId,
            readingTime,
            generationKwh,
            consumptionKwh,
            batteryLevelPercent,
        });

        return successResponse({ reading }, 201);
    } catch (error) {
        return errorResponse(error);
    }
}
