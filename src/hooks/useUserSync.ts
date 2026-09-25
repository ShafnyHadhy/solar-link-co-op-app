import { getApiUrl } from '@/lib/api';
import type { User } from '@/lib/server/db/schema';
import { useUser } from '@clerk/expo';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useUserSync() {
    const { user, isLoaded, isSignedIn } = useUser();
    const [dbUser, setDbUser] = useState<User | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);

    // Track the last synced Clerk user ID to avoid redundant network calls
    const lastSyncedUserIdRef = useRef<string | null>(null);

    const syncUser = useCallback(async () => {
        if (!isLoaded || !isSignedIn || !user) {
            return;
        }

        setIsSyncing(true);
        setSyncError(null);

        try {
            const primaryEmail = user.primaryEmailAddress?.emailAddress ?? '';
            const fullName =
                user.fullName ||
                [user.firstName, user.lastName].filter(Boolean).join(' ') ||
                user.username ||
                'Community Member';

            const role = user.publicMetadata?.role as
                | 'manager'
                | 'solar_owner'
                | 'household'
                | 'technician'
                | undefined;

            const response = await fetch(getApiUrl('/api/users/sync'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: user.id,
                    name: fullName,
                    email: primaryEmail,
                    avatarUrl: user.imageUrl ?? null,
                    phone: user.primaryPhoneNumber?.phoneNumber ?? null,
                    role,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to synchronize user');
            }

            setDbUser(data.data?.user ?? data.user);
            lastSyncedUserIdRef.current = user.id;
        } catch (err: any) {
            console.error('[UserSync Error]:', err?.message || err);
            setSyncError(err?.message || 'Failed to sync user with database');
        } finally {
            setIsSyncing(false);
        }
    }, [isLoaded, isSignedIn, user]);

    useEffect(() => {
        if (isLoaded && isSignedIn && user && lastSyncedUserIdRef.current !== user.id) {
            syncUser();
        }
    }, [isLoaded, isSignedIn, user, syncUser]);

    return {
        dbUser,
        isSyncing,
        syncError,
        refetchSync: syncUser,
    };
}
