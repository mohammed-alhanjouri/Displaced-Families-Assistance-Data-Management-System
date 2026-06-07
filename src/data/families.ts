export type AssistanceRecord = {
  id: number;
  date: string; // ISO date
  assistanceType: string;
  providerOrganization: string;
  notes?: string;
  recordedBy?: string;
};

export type Family = {
  nationalID: number;
  familyHeadName: string;
  phoneNumber: string;
  originalResidence: string;
  location: string;
  totalMembers: number;
  isFemaleHeaded: boolean;
  femaleHeadReason?: string;
  vulnerabilityScore: number;
  vulnerabilityLevel: 'Low' | 'Medium' | 'High';
  lastAssistanceDate: string; // ISO date
  lastUpdateDate?: string; // ISO date
  assistanceHistory: AssistanceRecord[];
};

export const familiesData: Family[] = [
  {
    nationalID: 420571234,
    familyHeadName: "Mohammed",
    phoneNumber: "0594296462",
    originalResidence: "Gaza City",
    location: "Location 1",
    totalMembers: 4,
    isFemaleHeaded: false,
    vulnerabilityScore: 8,
    vulnerabilityLevel: "High",
    lastAssistanceDate: "2024-05-15",
    assistanceHistory: [
      {
        id: 1,
        date: "2025-04-01",
        assistanceType: "Food Parcel",
        providerOrganization: "UNRWA",
        notes: "Monthly support",
        recordedBy: "Admin",
      },
      {
        id: 2,
        date: "2026-05-01",
        assistanceType: "Cash Assistance",
        providerOrganization: "Red Cross",
        notes: "Emergency support",
        recordedBy: "Admin",
      },
    ],
  },
  {
    nationalID: 900750662,
    familyHeadName: "Moamin",
    phoneNumber: "0599728827",
    originalResidence: "Gaza City",
    location: "Location 2",
    totalMembers: 3,
    isFemaleHeaded: true,
    femaleHeadReason: "Widow",
    vulnerabilityScore: 6,
    vulnerabilityLevel: "Medium",
    lastAssistanceDate: "2024-06-01",
    assistanceHistory: [],
  },
  {
    nationalID: 123456789,
    familyHeadName: "Williams",
    phoneNumber: "0591234567",
    originalResidence: "Beit Lahia City",
    location: "Location 3",
    totalMembers: 5,
    isFemaleHeaded: false,
    vulnerabilityScore: 4,
    vulnerabilityLevel: "Low",
    lastAssistanceDate: "2024-05-20",
    assistanceHistory: [],
  },
  {
    nationalID: 800123456,
    familyHeadName: "Brown",
    phoneNumber: "0591234567",
    originalResidence: "Gaza City",
    location: "Location 1",
    totalMembers: 2,
    isFemaleHeaded: true,
    femaleHeadReason: "Widow",
    vulnerabilityScore: 8,
    vulnerabilityLevel: "High",
    lastAssistanceDate: "2024-05-15",
    assistanceHistory: [],
  },
  {
    nationalID: 422198765,
    familyHeadName: "Jones",
    phoneNumber: "567-890-1234",
    originalResidence: "Gaza City",
    location: "Location 4",
    totalMembers: 6,
    isFemaleHeaded: false,
    vulnerabilityScore: 6,
    vulnerabilityLevel: "Medium",
    lastAssistanceDate: "2024-05-15",
    assistanceHistory: [],
  },
  {
    nationalID: 789012362,
    familyHeadName: "Garcia",
    phoneNumber: "678-901-2345",
    originalResidence: "North City",
    location: "Location 5",
    totalMembers: 4,
    isFemaleHeaded: false,
    vulnerabilityScore: 4,
    vulnerabilityLevel: "Low",
    lastAssistanceDate: "2024-05-20",
    assistanceHistory: [],
  },
  {
    nationalID: 345678901,
    familyHeadName: "Miller",
    phoneNumber: "789-012-3456",
    originalResidence: "Gaza City",
    location: "Location 6",
    totalMembers: 3,
    isFemaleHeaded: true,
    femaleHeadReason: "Widow",
    vulnerabilityScore: 8,
    vulnerabilityLevel: "High",
    lastAssistanceDate: "2024-05-15",
    assistanceHistory: [],
  },
  {
    nationalID: 800987654,
    familyHeadName: "Davis",
    phoneNumber: "890-123-4567",
    originalResidence: "North Gaza",
    location: "Location 7",
    totalMembers: 5,
    isFemaleHeaded: false,
    vulnerabilityScore: 6,
    vulnerabilityLevel: "Medium",
    lastAssistanceDate: "2024-05-20",
    assistanceHistory: [],
  },
  {
    nationalID: 567890123,
    familyHeadName: "Rodriguez",
    phoneNumber: "901-234-5678",
    originalResidence: "Khan Younis",
    location: "Location 8",
    totalMembers: 2,
    isFemaleHeaded: true,
    femaleHeadReason: "Divorced",
    vulnerabilityScore: 8,
    vulnerabilityLevel: "High",
    lastAssistanceDate: "2024-05-15",
    assistanceHistory: [],
  },
  {
    nationalID: 234567890,
    familyHeadName: "Martinez",
    phoneNumber: "012-345-6789",
    originalResidence: "Rafah",
    location: "Location 9",
    totalMembers: 4,
    isFemaleHeaded: false,
    vulnerabilityScore: 4,
    vulnerabilityLevel: "Low",
    lastAssistanceDate: "2024-05-20",
    assistanceHistory: [],
  },
];
