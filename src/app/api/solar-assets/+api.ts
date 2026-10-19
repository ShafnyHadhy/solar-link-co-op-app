import { requireSolarOwner } from "@/lib/server/auth/authorization";
import {
    createAsset,
    getAssetsByOwner,
} from "@/lib/server/services/solarService";
import { errorResponse } from "@/lib/server/utils/response";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const authUser = await requireSolarOwner(request, url.searchParams.get("ownerId") || undefined);
    const ownerId = authUser.id;

    const assets = await getAssetsByOwner(ownerId);

    return Response.json({
      success: true,
      assets,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const authUser = await requireSolarOwner(request, body?.ownerId);
    const ownerId = authUser.id;

    if (!body.id || !body.name || !body.assetType) {
      return Response.json(
        {
          error: "id, name and assetType are required",
        },
        { status: 400 },
      );
    }

    const asset = await createAsset({
      id: body.id,
      ownerId,
      assetType: body.assetType,
      name: body.name,
      capacityKw: body.capacityKw,
      status: body.status ?? "active",
      location: body.location,
      installedAt: body.installedAt ? new Date(body.installedAt) : undefined,
    });

    return Response.json(
      {
        success: true,
        asset,
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
