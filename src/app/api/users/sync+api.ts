import { getUserById, syncUser } from "@/lib/server/services/userService";
import {
    BadRequestError,
} from "@/lib/server/utils/errors";
import {
    errorResponse,
    successResponse,
} from "@/lib/server/utils/response";

interface SyncUserRequest {
    id: string;
    name: string;
    email: string;
    role?: "manager" | "solar_owner" | "household" | "technician";
    avatarUrl?: string | null;
    phone?: string | null;
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as SyncUserRequest;

        if (!body.id || !body.email || !body.name) {
            throw new BadRequestError(
                "Missing required fields: id, email, and name are required."
            );
        }

        const result = await syncUser(body);

        return successResponse(result, result.action === "created" ? 201 : 200);
    } catch (error) {
        return errorResponse(error);
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            throw new BadRequestError(
                "Query parameter 'userId' is required."
            );
        }

        const user = await getUserById(userId);

        return successResponse({ user });
    } catch (error) {
        return errorResponse(error);
    }
}