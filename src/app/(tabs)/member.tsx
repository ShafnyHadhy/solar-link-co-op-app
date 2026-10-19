import ManagerMembers from '@/components/manager/members/ManagerMembers';
import WaitUntilRoleAssigned from '@/components/shared/WaitUntilRoleAssigned';
import { useUserSync } from '@/hooks/useUserSync';
import { getUserRole } from '@/lib/getUserRole';
import { useUser } from '@clerk/expo';
import { Redirect } from 'expo-router';
import React from 'react';

const MemberScreen = () => {
    const { user, isLoaded, isSignedIn } = useUser();
    const { dbUser } = useUserSync();

    if (!isLoaded) {
        return null;
    }

    if (!isSignedIn || !user) {
        return <Redirect href="/(auth)/sign-in" />;
    }

    const role = getUserRole(user?.publicMetadata?.role, dbUser?.role);

    if (role === "manager") {
        return <ManagerMembers />;
    }

    if (!role) {
        return <WaitUntilRoleAssigned />;
    }

    return <Redirect href="/(tabs)" />;
};

export default MemberScreen;