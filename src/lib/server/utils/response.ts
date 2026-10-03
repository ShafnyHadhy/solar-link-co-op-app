import { AppError } from "./errors";

export function successResponse<T>(
    data: T,
    status = 200
) {
    return Response.json(
        {
            success: true,
            data,
        },
        { status }
    );
}

export function errorResponse(
    error: unknown
) {
    if (error instanceof AppError || (error && typeof (error as any).statusCode === 'number')) {
        return Response.json(
            {
                success: false,
                error: (error as any).message,
            },
            { status: (error as any).statusCode }
        );
    }

    console.error("[API Error]", error);

    return Response.json(
        {
            success: false,
            error: "Internal server error",
        },
        { status: 500 }
    );
}