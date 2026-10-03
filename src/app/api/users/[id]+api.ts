// Member Details API Route
// GET /api/users/:id — Retrieve specific member details with energy context
import { getMemberDetails } from "@/lib/server/services/userService";
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
