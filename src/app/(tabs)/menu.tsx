import HouseholdConsumerMenu from '@/components/household/menu/HouseholdConsumerMenu';
import ManagerMenu from '@/components/manager/menu/ManagerMenu';
import SolarOwnerMenu from '@/components/solar-owner/menu/SolarOwnerMenu';
import { useUserSync } from '@/hooks/useUserSync';
import { getUserRole } from '@/lib/getUserRole';
import { useUser } from '@clerk/expo';
import React from 'react';

const MenuScreen = () => {
    const { user } = useUser();
    const { dbUser } = useUserSync();
    const role = getUserRole(user?.publicMetadata?.role as string | undefined, dbUser?.role);

    if (role === 'solar_owner') {
        return <SolarOwnerMenu />;
    }

    if (role === 'household') {
        return <HouseholdConsumerMenu />;
    }

    // Default to Grid Manager Menu
    return <ManagerMenu />;
};

export default MenuScreen;