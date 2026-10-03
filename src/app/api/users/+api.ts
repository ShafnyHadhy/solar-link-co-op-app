// Users API Route
// GET /api/users — Retrieve community members for management (or single member if ?id= is passed)
// PATCH /api/users — Update member status (supports ?id= or body.id/userId)
import { getAllUsers, getMemberDetails, updateMemberStatus } from "@/lib/server/services/userService";
import { errorResponse } from "@/lib/server/utils/response";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const memberId = url.searchParams.get("id");

        if (memberId) {
            const member = await getMemberDetails(memberId);
            return Response.json({
                success: true,
                member,
                data: { member },
            });
        }

        const users = await getAllUsers();

        return Response.json({
            success: true,
            users,
            members: users,
            data: { users, members: users },
        });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function PATCH(request: Request) {
    try {
        const url = new URL(request.url);
        const queryId = url.searchParams.get("id");

        const body = await request.json();
        const memberId = queryId || body.id || body.userId;

        if (!memberId) {
            return Response.json(
                { success: false, error: "Member ID is required" },
                { status: 400 }
            );
        }

        const { status } = body;
        const managerId = request.headers.get("x-user-id");

        const updatedUser = await updateMemberStatus(memberId, status, managerId);

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
