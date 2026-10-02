// Users API Route
// GET /api/users — Retrieve community members for management
import { getAllUsers } from "@/lib/server/services/userService";
import { errorResponse } from "@/lib/server/utils/response";

export async function GET(request: Request) {
    try {
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
