import HouseholdEnergy from '@/components/household/energy/HouseholdEnergy';
import ManagerEnergyRequests from '@/components/manager/energy/ManagerEnergyRequests';
import WaitUntilRoleAssigned from '@/components/shared/WaitUntilRoleAssigned';
import SolarOwnerEnergy from '@/components/solar-owner/energy/SolarOwnerEnergy';
import TechnicianEnergyScreen from '@/components/technician/energy/TechnicianEnergyScreen';
import { getUserRole } from '@/lib/getUserRole';
import { useUser } from '@clerk/expo';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

const EnergyScreen = () => {
    const { user, isLoaded } = useUser();
    const params = useLocalSearchParams<{ tab?: string }>();

    if (!isLoaded) {
        return null;
    }

    const role = getUserRole(
        user?.publicMetadata?.role
    );

    switch (role) {
        case "manager":
            return <ManagerEnergyRequests />;

        case "solar_owner":
            return <SolarOwnerEnergy />;

        case "household":
            return (
                <HouseholdEnergy
                    initialTab={params.tab === "pending" || params.tab === "requests" ? "requests" : "create"}
                    initialFilter={params.tab === "pending" ? "pending" : "all"}
                />
            );

        case "technician":
            return <TechnicianEnergyScreen />;

        default:
            return <WaitUntilRoleAssigned />;
    }
};

export default EnergyScreen;