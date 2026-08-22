export type StaffRole = 'Super Admin' | 'Admin';
export type StaffStatus = 'Active' | 'Revoked';

export interface SystemActivity {
  id: string;
  category: 'Support' | 'Account' | 'System';
  action: string;
  target: string;
  timestamp: string;
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // Keep for backward compatibility/simplicity
  initials: string;
  role: StaffRole;
  status: StaffStatus;
  email: string;
  phone: string;
  lastActive: string;
  activity: SystemActivity[];
}

export const staffData: Staff[] = [
  {
    id: 'S1',
    firstName: 'Hannah',
    lastName: 'Osei',
    name: 'Hannah Osei',
    initials: 'H',
    role: 'Super Admin',
    status: 'Active',
    email: 'hannah@klavora.com',
    phone: '0241234567',
    lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    activity: [
      { id: 'A1', category: 'Account', action: 'Manually locked account due to overdue payment', target: 'CarePoint Pharmacy', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() }, // 10 mins ago
      { id: 'A2', category: 'Support', action: 'Closed ticket #1042 regarding dashboard access', target: 'City Health', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }, // 2 hours ago
      { id: 'A3', category: 'System', action: 'Updated global Starter Plan pricing', target: 'System Wide', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() } // Yesterday
    ]
  },
  {
    id: 'S2',
    firstName: 'Try',
    lastName: 'Admin',
    name: 'Try Admin',
    initials: 'T',
    role: 'Admin',
    status: 'Active',
    email: 'try@klavora.com',
    phone: '0559876543',
    lastActive: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    activity: []
  },
  {
    id: 'S3',
    firstName: 'Andy',
    lastName: 'Nkrumah',
    name: 'Andy Nkrumah',
    initials: 'AN',
    role: 'Admin',
    status: 'Revoked',
    email: 'andy@klavora.com',
    phone: '0201122334',
    lastActive: new Date(Date.now() - 76 * 24 * 60 * 60 * 1000).toISOString(),
    activity: []
  },
  {
    id: 'S4',
    firstName: 'Herbert',
    lastName: 'Mensah',
    name: 'Herbert Mensah',
    initials: 'HM',
    role: 'Admin',
    status: 'Active',
    email: 'herbert@klavora.com',
    phone: '0244556677',
    lastActive: new Date(Date.now() - 81 * 24 * 60 * 60 * 1000).toISOString(),
    activity: []
  }
];
