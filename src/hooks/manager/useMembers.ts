import { getApiUrl } from "@/lib/api";
import { CommunityMember, MemberStatus } from "@/types/member";
import { UserRole } from "@/types/role";
import { useCallback, useEffect, useState } from "react";

export function useMembers() {
    const [members, setMembers] = useState<CommunityMember[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(getApiUrl("/api/users"));

            if (!response.ok) {
                throw new Error(`Failed to fetch members (${response.status})`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to load members");
            }

            const list = data.users || data.members || data.data?.users || [];
            setMembers(list);
        } catch (err: any) {
            console.error("[useMembers Error]", err);
            setError(err?.message || "Failed to load members");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    return {
        members,
        setMembers,
        loading,
        error,
        refetch: fetchMembers,
    };
}

export async function fetchMemberDetails(memberId: string): Promise<any> {
    const response = await fetch(getApiUrl(`/api/users?id=${encodeURIComponent(memberId)}`));

    if (!response.ok) {
        throw new Error(`Failed to fetch member details (${response.status})`);
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error || "Failed to load member details");
    }

    return data.member || data.data?.member;
}

export async function updateMemberStatusApi(
    memberId: string,
    status: MemberStatus,
    managerId?: string
): Promise<any> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (managerId) {
        headers["x-user-id"] = managerId;
    }

    const response = await fetch(getApiUrl(`/api/users/${encodeURIComponent(memberId)}`), {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.error || `Failed to update member status (${response.status})`);
    }

    return data.user || data.member || data.data?.user;
}

export async function updateMemberRoleApi(
    memberId: string,
    role: UserRole,
    managerId?: string
): Promise<any> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (managerId) {
        headers["x-user-id"] = managerId;
    }

    const response = await fetch(getApiUrl(`/api/users/${encodeURIComponent(memberId)}`), {
        method: "PATCH",
        headers,
        body: JSON.stringify({ role }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.error || `Failed to update member role (${response.status})`);
    }

    return data.user || data.member || data.data?.user;
}

export async function updateMemberApi(
    memberId: string,
    params: { role?: UserRole; status?: MemberStatus },
    managerId?: string
): Promise<any> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (managerId) {
        headers["x-user-id"] = managerId;
    }

    const response = await fetch(getApiUrl(`/api/users/${encodeURIComponent(memberId)}`), {
        method: "PATCH",
        headers,
        body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.error || `Failed to update member (${response.status})`);
    }

    return data.user || data.member || data.data?.user;
}


