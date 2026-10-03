// Member Details and Update API Route
// GET /api/users/:id — Retrieve specific member details with energy context
// PATCH /api/users/:id — Update member role (manager, solar_owner, household, technician) and/or status
import {
    getMemberDetails,
    updateMemberRole,
    updateMemberStatus,
} from "@/lib/server/services/userService";
import { errorResponse } from "@/lib/server/utils/response";

export async function GET(request: Request, { id }: Record<string, string>) {
    try {
        if (!id) {
            return Response.json(
                { success: false, error: "Member ID is required" },
                { status: 400 }
            );
        }

        const member = await getMemberDetails(id);

        return Response.json({
            success: true,
            member,
            data: { member },
        });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function PATCH(request: Request, { id }: Record<string, string>) {
    try {
        if (!id) {
            return Response.json(
                { success: false, error: "Member ID is required" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { role, status } = body;

        if (role === undefined && status === undefined) {
            return Response.json(
                { success: false, error: "At least one of 'role' or 'status' is required" },
                { status: 400 }
            );
        }

        const managerId = request.headers.get("x-user-id");

        let updatedUser;

        // Role assignment: Enforces manager authentication & authorization in userService
        if (role !== undefined) {
            updatedUser = await updateMemberRole(id, role, managerId);
        }

        // Status update
        if (status !== undefined) {
            updatedUser = await updateMemberStatus(id, status, managerId);
        }

        return Response.json({
            success: true,
            user: updatedUser,
            member: updatedUser,
            data: { user: updatedUser, member: updatedUser },
        });
    } catch (error) {
        return errorResponse(error);
    }
}
