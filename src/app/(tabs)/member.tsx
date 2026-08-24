import ManagerMembers from '@/components/manager/members/ManagerMembers';
import WaitUntilRoleAssigned from '@/components/shared/WaitUntilRoleAssigned';
import { getUserRole } from '@/lib/getUserRole';
import { useUser } from '@clerk/expo';
import { Redirect } from 'expo-router';
import React from 'react';

const MemberScreen = () => {
    const { user, isLoaded, isSignedIn } = useUser();

    if (!isLoaded) {
        return null;
    }

    if (!isSignedIn || !user) {
        return <Redirect href="/sign-in" />;
    }

    const role = getUserRole(user?.publicMetadata?.role);

    switch (role) {
        case "manager":
            return <ManagerMembers />;

        default:
            return <ManagerMembers />;
    }
};

export default MemberScreen;