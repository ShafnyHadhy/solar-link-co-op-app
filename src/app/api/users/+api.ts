// Users API Route
// GET /api/users — Retrieve community members for management (or single member if ?id= is passed)
import { getAllUsers, getMemberDetails } from "@/lib/server/services/userService";
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
