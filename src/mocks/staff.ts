export type StaffRole = 'Super Admin' | 'Admin';

export type StaffStatus = 'Active' | 'Inactive' | 'Suspended';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  status: StaffStatus;
  assignedPharmacies: string[];
  lastActive: string;
  createdAt: string;
}

export const staffMembers: StaffMember[] = [
  {
    id: 'SA001',
    name: 'Kwame Asante',
    email: 'admin@klavora.io',
    phone: '+233 24 100 0001',
    role: 'Super Admin',
    status: 'Active',
    assignedPharmacies: ['PH001', 'PH002', 'PH003', 'PH004', 'PH005', 'PH006', 'PH007', 'PH008', 'PH009', 'PH010', 'PH011', 'PH012', 'PH013', 'PH014', 'PH015', 'PH016', 'PH017', 'PH018', 'PH019', 'PH020', 'PH021', 'PH022', 'PH023', 'PH024'],
    lastActive: '2026-04-13T08:30:00',
    createdAt: '2024-01-01',
  },
  {
    id: 'SA002',
    name: 'Abena Mensah',
    email: 'abena@klavora.io',
    phone: '+233 20 100 0002',
    role: 'Super Admin',
    status: 'Active',
    assignedPharmacies: ['PH001', 'PH002', 'PH003', 'PH004', 'PH005', 'PH006', 'PH007', 'PH008', 'PH009', 'PH010', 'PH011', 'PH012', 'PH013', 'PH014', 'PH015', 'PH016', 'PH017', 'PH018', 'PH019', 'PH020', 'PH021', 'PH022', 'PH023', 'PH024'],
    lastActive: '2026-04-13T07:45:00',
    createdAt: '2024-01-15',
  },
  {
    id: 'AD001',
    name: 'Kofi Boateng',
    email: 'kofi@klavora.io',
    phone: '+233 27 200 0003',
    role: 'Admin',
    status: 'Active',
    assignedPharmacies: ['PH001', 'PH003', 'PH006', 'PH011', 'PH012'],
    lastActive: '2026-04-12T17:30:00',
    createdAt: '2024-03-10',
  },
  {
    id: 'AD002',
    name: 'Ama Owusu',
    email: 'ama@klavora.io',
    phone: '+233 24 300 0004',
    role: 'Admin',
    status: 'Active',
    assignedPharmacies: ['PH004', 'PH005', 'PH009', 'PH017', 'PH020'],
    lastActive: '2026-04-12T16:00:00',
    createdAt: '2024-04-20',
  },
  {
    id: 'AD003',
    name: 'Yaw Darko',
    email: 'yaw@klavora.io',
    phone: '+233 26 400 0005',
    role: 'Admin',
    status: 'Active',
    assignedPharmacies: ['PH002', 'PH008', 'PH010', 'PH015', 'PH018', 'PH024'],
    lastActive: '2026-04-13T07:15:00',
    createdAt: '2024-05-05',
  },
  {
    id: 'AD004',
    name: 'Efua Asare',
    email: 'efua@klavora.io',
    phone: '+233 23 500 0006',
    role: 'Admin',
    status: 'Inactive',
    assignedPharmacies: ['PH007', 'PH013', 'PH014'],
    lastActive: '2026-03-15T12:00:00',
    createdAt: '2024-06-12',
  },
  {
    id: 'AD005',
    name: 'Ibrahim Alhassan',
    email: 'ibrahim@klavora.io',
    phone: '+233 20 600 0007',
    role: 'Admin',
    status: 'Suspended',
    assignedPharmacies: ['PH006', 'PH023'],
    lastActive: '2026-02-20T09:00:00',
    createdAt: '2024-07-01',
  },
  {
    id: 'AD006',
    name: 'Nana Acheampong',
    email: 'nana@klavora.io',
    phone: '+233 26 700 0008',
    role: 'Admin',
    status: 'Active',
    assignedPharmacies: ['PH007', 'PH015', 'PH024'],
    lastActive: '2026-04-13T06:45:00',
    createdAt: '2024-08-15',
  },
  {
    id: 'AD007',
    name: 'Akosua Frimpong',
    email: 'akosua@klavora.io',
    phone: '+233 27 800 0009',
    role: 'Admin',
    status: 'Active',
    assignedPharmacies: ['PH009', 'PH021', 'PH022'],
    lastActive: '2026-04-11T14:30:00',
    createdAt: '2024-09-20',
  },
  {
    id: 'AD008',
    name: 'Dela Adzaho',
    email: 'dela@klavora.io',
    phone: '+233 20 900 0010',
    role: 'Admin',
    status: 'Active',
    assignedPharmacies: ['PH005', 'PH019'],
    lastActive: '2026-04-12T11:00:00',
    createdAt: '2024-10-10',
  },
];
