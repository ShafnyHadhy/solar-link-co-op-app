import { requireSolarOwner } from "@/lib/server/auth/authorization";
import { getAssetById, updateAsset } from "@/lib/server/services/solarService";
import { errorResponse } from "@/lib/server/utils/response";

export async function GET(request: Request, { id }: Record<string, string>) {
  try {
    const url = new URL(request.url);
    await requireSolarOwner(request, url.searchParams.get("ownerId") || undefined);

    const asset = await getAssetById(id);

    if (!asset) {
      return Response.json({ error: "Solar asset not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      asset,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request, { id }: Record<string, string>) {
  try {
    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    await requireSolarOwner(request, body?.ownerId || url.searchParams.get("ownerId") || undefined);

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
    return errorResponse(error);
  }
}
