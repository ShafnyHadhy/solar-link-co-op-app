// Manager Individual Energy Request API Route
// GET /api/manager/energy-requests/:id — retrieve single energy request details
// PATCH /api/manager/energy-requests/:id — approve or reject a pending energy request

import {
    approveEnergyRequest,
    getEnergyRequestById,
    rejectEnergyRequest,
} from "@/lib/server/services/energyRequestService";
import { db } from "@/lib/server/db/client";
import { users } from "@/lib/server/db/schema";
import { eq } from "drizzle-orm";
import { BadRequestError, UnauthorizedError } from "@/lib/server/utils/errors";
import { errorResponse } from "@/lib/server/utils/response";

export async function GET(
    request: Request,
    context?: { params?: { id?: string } }
) {
    try {
        // Retrieve id from route params or fallback to URL pathname
        let id = context?.params?.id;

        if (!id && request.url) {
            const urlObj = new URL(request.url);
            const segments = urlObj.pathname.split("/").filter(Boolean);
            id = segments[segments.length - 1];
        }

        if (!id) {
            throw new BadRequestError("Energy request ID is required");
        }

        const energyRequest = await getEnergyRequestById(id);

        return Response.json({
            success: true,
            request: energyRequest,
            data: energyRequest,
        });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function PATCH(
    request: Request,
    context?: { params?: { id?: string } }
) {
    try {
        // Retrieve id from route params or fallback to URL pathname
        let id = context?.params?.id;

        if (!id && request.url) {
            const urlObj = new URL(request.url);
            const segments = urlObj.pathname.split("/").filter(Boolean);
            id = segments[segments.length - 1];
        }

        if (!id) {
            throw new BadRequestError("Energy request ID is required");
        }

        const body = await request.json().catch(() => ({}));

        if (body?.action !== "approve" && body?.action !== "reject") {
            throw new BadRequestError(
                "Invalid action. Expected { \"action\": \"approve\" } or { \"action\": \"reject\" }"
            );
        }

        // Obtain manager identity from Clerk header/body or fallback to registered manager in db
        let managerId =
            request.headers.get("x-user-id") ||
            request.headers.get("x-manager-id") ||
            body?.managerId;

        if (!managerId) {
            const [firstManager] = await db
                .select({ id: users.id })
                .from(users)
                .where(eq(users.role, "manager"))
                .limit(1);

            if (firstManager) {
                managerId = firstManager.id;
            }
        }

        if (!managerId) {
            throw new UnauthorizedError("Manager identity could not be verified. Authentication required.");
        }

        const updatedRequest =
            body.action === "approve"
                ? await approveEnergyRequest(id, managerId)
                : await rejectEnergyRequest(id, managerId);

        const message =
            body.action === "approve"
                ? "Energy request approved successfully"
                : "Energy request rejected successfully";

        return Response.json({
            success: true,
            message,
            request: updatedRequest,
            data: updatedRequest,
        });
    } catch (error) {
        return errorResponse(error);
    }
}

