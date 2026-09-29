// Solar Asset Detail API Routes
// GET /api/solar-assets/:id  — get a single asset
// PUT /api/solar-assets/:id  — update an asset

import { getAssetById, updateAsset } from "@/lib/server/services/solarService";

export async function GET(request: Request, { id }: Record<string, string>) {
  try {
    const asset = await getAssetById(id);

    if (!asset) {
      return Response.json({ error: "Solar asset not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      asset,
    });
  } catch (error) {
    console.error("Failed to get asset:", error);

    return Response.json({ error: "Failed to get asset" }, { status: 500 });
  }
}

export async function PUT(request: Request, { id }: Record<string, string>) {
  try {
    const body = await request.json();

    const asset = await updateAsset(id, {
      name: body.name,
      assetType: body.assetType,
      capacityKw: body.capacityKw,
      status: body.status,
      location: body.location,
      installedAt: body.installedAt ? new Date(body.installedAt) : undefined,
    });

    if (!asset) {
      return Response.json({ error: "Solar asset not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      asset,
    });
  } catch (error) {
    console.error("Failed to update asset:", error);

    return Response.json({ error: "Failed to update asset" }, { status: 500 });
  }
}
