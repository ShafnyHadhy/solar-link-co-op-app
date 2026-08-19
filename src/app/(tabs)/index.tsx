import HouseholdDashboard from '@/components/household/dashboard/HouseholdDashboard';
import ManagementDashboard from '@/components/manager/dashboard/ManagementDashboard';
import WaitUntilRoleAssigned from '@/components/shared/WaitUntilRoleAssigned';
import SolarOwnerDashboard from '@/components/solar-owner/dashboard/SolarOwnerDashboard';
import TechnicianDashboard from '@/components/technician/dashboard/TechnicianDashboard';
import { getUserRole } from '@/lib/getUserRole';
import { useUser } from '@clerk/expo';
import { Redirect } from 'expo-router';

export default function HomeScreen() {

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
            return <ManagementDashboard />

        case "solar_owner":
            return <SolarOwnerDashboard />

        case "household":
            return <HouseholdDashboard />

        case "technician":
            return <TechnicianDashboard />

        default:
            return <WaitUntilRoleAssigned />;
    }

}
