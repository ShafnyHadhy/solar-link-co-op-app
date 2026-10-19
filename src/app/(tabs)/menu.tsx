import HouseholdConsumerMenu from '@/components/household/menu/HouseholdConsumerMenu';
import ManagerMenu from '@/components/manager/menu/ManagerMenu';
import WaitUntilRoleAssigned from '@/components/shared/WaitUntilRoleAssigned';
import SolarOwnerMenu from '@/components/solar-owner/menu/SolarOwnerMenu';
import TechnicianMenu from '@/components/technician/menu/TechnicianMenu';
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

    if (role === 'technician') {
        return <TechnicianMenu />;
    }

    if (role === 'manager') {
        return <ManagerMenu />;
    }

    return <WaitUntilRoleAssigned />;
};

export default MenuScreen;