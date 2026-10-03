import { getApiUrl } from "@/lib/api";
import { CommunityMember } from "@/types/member";
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

