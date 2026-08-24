export type TechnicianFilter =
    | 'All'
    | 'Critical'
    | 'Warning'
    | 'Maintenance';

export interface ServiceRequest {
    id: string;
    systemName: string;
    location: string;
    issue: string;
    severity: 'High' | 'Medium' | 'Low';
    status: 'Critical' | 'Warning' | 'Normal' | 'Maintenance';
    equipment: string;
}

export interface MaintenanceJob {
    id: string;
    systemName: string;
    location: string;
    date: string;
    time: string;
    type: string;
    priority: 'High' | 'Medium' | 'Routine';
}

export const technicianSummary = {
    healthySystems: 18,
    activeFaults: 3,
    maintenanceDue: 4,
};

export const serviceRequests: ServiceRequest[] = [
    {
        id: 'SR-001',
        systemName: 'Sunny Valley Solar',
        location: 'Kandy',
        issue: 'Inverter Failure',
        severity: 'High',
        status: 'Critical',
        equipment: 'Huawei SUN2000 Inverter',
    },
    {
        id: 'SR-002',
        systemName: 'EcoGrid Community',
        location: 'Peradeniya',
        issue: 'Low Energy Generation',
        severity: 'Medium',
        status: 'Warning',
        equipment: 'Solar Panel Array',
    },
    {
        id: 'SR-003',
        systemName: 'GreenHome Solar',
        location: 'Katugastota',
        issue: 'No Active Faults',
        severity: 'Low',
        status: 'Normal',
        equipment: 'Solar System',
    },
    {
        id: 'SR-004',
        systemName: 'LakeView Solar',
        location: 'Kundasale',
        issue: 'Battery Inspection Required',
        severity: 'Medium',
        status: 'Maintenance',
        equipment: 'Battery Storage Unit',
    },
];

export const maintenanceJobs: MaintenanceJob[] = [
    {
        id: 'MT-001',
        systemName: 'GreenHome Solar',
        location: 'Katugastota',
        date: 'Tomorrow',
        time: '10:30 AM',
        type: 'Panel Inspection',
        priority: 'Routine',
    },
    {
        id: 'MT-002',
        systemName: 'EcoGrid Community',
        location: 'Peradeniya',
        date: '25 Aug',
        time: '11:00 AM',
        type: 'Battery Inspection',
        priority: 'Medium',
    },
    {
        id: 'MT-003',
        systemName: 'Sunny Valley Solar',
        location: 'Kandy',
        date: '26 Aug',
        time: '09:00 AM',
        type: 'Inverter Inspection',
        priority: 'High',
    },
];

export interface FaultDetail {
    requestId: string;
    faultType: string;
    errorCode: string;
    detectedTime: string;
    currentPerformance: string;
    expectedPerformance: string;

    equipmentModel: string;
    equipmentSerial: string;
    installationDate: string;

    previousFaults: {
        date: string;
        issue: string;
        status: string;
    }[];

    maintenanceHistory: {
        date: string;
        action: string;
        technician: string;
    }[];

    recommendedAction: string;
}

export const faultDetails: FaultDetail[] = [
    {
        requestId: 'SR-001',
        faultType: 'Inverter Failure',
        errorCode: 'INV-E24',
        detectedTime: 'Today, 09:42 AM',

        currentPerformance: '1.8 kW',
        expectedPerformance: '4.2 kW',

        equipmentModel: 'Huawei SUN2000',
        equipmentSerial: 'HW-SUN-45821',
        installationDate: '12 March 2024',

        previousFaults: [
            {
                date: '15 July 2026',
                issue: 'DC Voltage Fluctuation',
                status: 'Resolved',
            },
            {
                date: '02 May 2026',
                issue: 'Communication Error',
                status: 'Resolved',
            },
        ],

        maintenanceHistory: [
            {
                date: '20 July 2026',
                action: 'Checked DC input and inverter connections',
                technician: 'Technician Team',
            },
            {
                date: '10 April 2026',
                action: 'Routine inverter inspection',
                technician: 'Technician Team',
            },
        ],

        recommendedAction:
            'Inspect the inverter DC connection and input voltage. Check cable connections before replacing the inverter.',
    },

    {
        requestId: 'SR-002',
        faultType: 'Low Energy Generation',
        errorCode: 'GEN-L12',
        detectedTime: 'Today, 11:15 AM',

        currentPerformance: '2.6 kW',
        expectedPerformance: '4.0 kW',

        equipmentModel: 'Solar Panel Array',
        equipmentSerial: 'SPA-ECO-2201',
        installationDate: '08 January 2025',

        previousFaults: [
            {
                date: '08 June 2026',
                issue: 'Panel Output Reduction',
                status: 'Resolved',
            },
        ],

        maintenanceHistory: [
            {
                date: '12 June 2026',
                action: 'Panel cleaning and output inspection',
                technician: 'Technician Team',
            },
        ],

        recommendedAction:
            'Check panel cleanliness, shading conditions and individual panel output before scheduling an on-site inspection.',
    },

    {
        requestId: 'SR-003',
        faultType: 'No Active Fault',
        errorCode: 'N/A',
        detectedTime: 'No active fault',

        currentPerformance: '4.1 kW',
        expectedPerformance: '4.0 kW',

        equipmentModel: 'Solar System',
        equipmentSerial: 'GHS-3008',
        installationDate: '22 September 2024',

        previousFaults: [],

        maintenanceHistory: [
            {
                date: '01 August 2026',
                action: 'Routine system inspection',
                technician: 'Technician Team',
            },
        ],

        recommendedAction:
            'No immediate action is required. Continue monitoring system performance.',
    },

    {
        requestId: 'SR-004',
        faultType: 'Battery Inspection Required',
        errorCode: 'BAT-M05',
        detectedTime: 'Yesterday, 04:30 PM',

        currentPerformance: '71%',
        expectedPerformance: '90%+',

        equipmentModel: 'Lithium Battery Storage',
        equipmentSerial: 'BAT-LV-9912',
        installationDate: '14 November 2024',

        previousFaults: [
            {
                date: '18 March 2026',
                issue: 'Slow Charging',
                status: 'Resolved',
            },
        ],

        maintenanceHistory: [
            {
                date: '20 March 2026',
                action: 'Battery health inspection',
                technician: 'Technician Team',
            },
        ],

        recommendedAction:
            'Perform a battery health inspection and check charging cycles, temperature and connection status.',
    },
];