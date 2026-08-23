import HouseholdEnergy from '@/components/household/energy/HouseholdEnergy';
import ManagerEnergyRequests from '@/components/manager/energy/ManagerEnergyRequests';
import WaitUntilRoleAssigned from '@/components/shared/WaitUntilRoleAssigned';
import SolarOwnerEnergy from '@/components/solar-owner/energy/SolarOwnerEnergy';
import TechnicianEnergy from '@/components/technician/energy/TechnicianEnergy';
import { getUserRole } from '@/lib/getUserRole';
import { useUser } from '@clerk/expo';
import { Redirect } from 'expo-router';
import React from 'react';

const EnergyScreen = () => {

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
            return <ManagerEnergyRequests />

        case "solar_owner":
            return <SolarOwnerEnergy />

        case "household":
            return <HouseholdEnergy />

        case "technician":
            return <TechnicianEnergy />

        default:
            return <WaitUntilRoleAssigned />;
    }

};

export default EnergyScreen;