export type Plan = 'Starter' | 'Growth' | 'Scale' | 'Trial';
export type PharmacyStatus = 'Active' | 'Trial' | 'Churned' | 'Suspended';
export type Region = 'Greater Accra' | 'Ashanti' | 'Western' | 'Eastern' | 'Northern' | 'Volta' | 'Central' | 'Brong-Ahafo';

export interface Pharmacy {
  id: string;
  name: string;
  owner: string;
  phone: string;
  email: string;
  region: Region;
  plan: Plan;
  status: PharmacyStatus;
  joined: string;
  lastActive: string;
  drugCount: number;
  batchCount: number;
  staffCount: number;
  totalTransactions: number;
  address: string;
}

export const pharmacies: Pharmacy[] = [
  { id: 'PH001', name: 'Medplus Pharmacy', owner: 'Kwame Asante', phone: '+233 24 123 4567', email: 'kwame@medplus.gh', region: 'Greater Accra', plan: 'Growth', status: 'Active', joined: '2024-01-15', lastActive: '2026-04-13', drugCount: 312, batchCount: 489, staffCount: 6, totalTransactions: 14820, address: '14 Ring Road East, Accra' },
  { id: 'PH002', name: 'HealthFirst Pharmacy', owner: 'Abena Mensah', phone: '+233 20 987 6543', email: 'abena@healthfirst.gh', region: 'Ashanti', plan: 'Scale', status: 'Active', joined: '2024-02-03', lastActive: '2026-04-12', drugCount: 521, batchCount: 834, staffCount: 11, totalTransactions: 28340, address: '7 Adum Street, Kumasi' },
  { id: 'PH003', name: 'CarePoint Drugs', owner: 'Kofi Boateng', phone: '+233 27 456 7890', email: 'kofi@carepoint.gh', region: 'Western', plan: 'Starter', status: 'Active', joined: '2024-03-20', lastActive: '2026-04-11', drugCount: 98, batchCount: 143, staffCount: 3, totalTransactions: 3210, address: '22 Harbour Road, Takoradi' },
  { id: 'PH004', name: 'Sunrise Pharmacy', owner: 'Ama Owusu', phone: '+233 24 321 0987', email: 'ama@sunrise.gh', region: 'Greater Accra', plan: 'Starter', status: 'Active', joined: '2024-04-05', lastActive: '2026-04-10', drugCount: 145, batchCount: 201, staffCount: 4, totalTransactions: 5670, address: '3 Spintex Road, Accra' },
  { id: 'PH005', name: 'Volta Meds', owner: 'Edem Agbeko', phone: '+233 23 654 3210', email: 'edem@voltameds.gh', region: 'Volta', plan: 'Trial', status: 'Trial', joined: '2026-03-28', lastActive: '2026-04-09', drugCount: 67, batchCount: 89, staffCount: 2, totalTransactions: 420, address: '5 Ho Main Street, Ho' },
  { id: 'PH006', name: 'Northern Pharma', owner: 'Ibrahim Alhassan', phone: '+233 20 111 2233', email: 'ibrahim@northernpharma.gh', region: 'Northern', plan: 'Starter', status: 'Active', joined: '2024-05-12', lastActive: '2026-04-08', drugCount: 112, batchCount: 167, staffCount: 3, totalTransactions: 4120, address: '9 Tamale Central, Tamale' },
  { id: 'PH007', name: 'GoldCoast Pharmacy', owner: 'Nana Acheampong', phone: '+233 26 789 0123', email: 'nana@goldcoast.gh', region: 'Central', plan: 'Growth', status: 'Active', joined: '2024-06-01', lastActive: '2026-04-13', drugCount: 278, batchCount: 412, staffCount: 7, totalTransactions: 11230, address: '18 Cape Coast Castle Rd, Cape Coast' },
  { id: 'PH008', name: 'Apex Drugs Ltd', owner: 'Yaw Darko', phone: '+233 24 555 6677', email: 'yaw@apexdrugs.gh', region: 'Ashanti', plan: 'Scale', status: 'Active', joined: '2024-06-15', lastActive: '2026-04-12', drugCount: 445, batchCount: 712, staffCount: 9, totalTransactions: 22100, address: '31 Bantama Road, Kumasi' },
  { id: 'PH009', name: 'Eastside Pharmacy', owner: 'Akosua Frimpong', phone: '+233 27 333 4455', email: 'akosua@eastside.gh', region: 'Eastern', plan: 'Trial', status: 'Trial', joined: '2026-04-01', lastActive: '2026-04-11', drugCount: 34, batchCount: 45, staffCount: 2, totalTransactions: 180, address: '6 Koforidua Road, Koforidua' },
  { id: 'PH010', name: 'Pharmalink GH', owner: 'Kwesi Tetteh', phone: '+233 20 222 3344', email: 'kwesi@pharmalink.gh', region: 'Greater Accra', plan: 'Growth', status: 'Active', joined: '2024-07-20', lastActive: '2026-04-13', drugCount: 334, batchCount: 521, staffCount: 8, totalTransactions: 16780, address: '45 Tema Motorway, Accra' },
  { id: 'PH011', name: 'Brong Meds', owner: 'Adwoa Amponsah', phone: '+233 23 888 9900', email: 'adwoa@brongmeds.gh', region: 'Brong-Ahafo', plan: 'Starter', status: 'Active', joined: '2024-08-10', lastActive: '2026-04-07', drugCount: 89, batchCount: 124, staffCount: 3, totalTransactions: 2890, address: '12 Sunyani Road, Sunyani' },
  { id: 'PH012', name: 'QuickCure Pharmacy', owner: 'Fiifi Mensah', phone: '+233 24 777 8899', email: 'fiifi@quickcure.gh', region: 'Greater Accra', plan: 'Starter', status: 'Churned', joined: '2024-03-01', lastActive: '2025-12-15', drugCount: 76, batchCount: 98, staffCount: 2, totalTransactions: 1230, address: '8 Dansoman Road, Accra' },
  { id: 'PH013', name: 'Wellness Hub Pharmacy', owner: 'Efua Asare', phone: '+233 26 444 5566', email: 'efua@wellnesshub.gh', region: 'Ashanti', plan: 'Trial', status: 'Trial', joined: '2026-03-15', lastActive: '2026-04-10', drugCount: 52, batchCount: 71, staffCount: 2, totalTransactions: 310, address: '3 Oforikrom Road, Kumasi' },
  { id: 'PH014', name: 'SafeMeds Pharmacy', owner: 'Kwabena Osei', phone: '+233 20 666 7788', email: 'kwabena@safemeds.gh', region: 'Western', plan: 'Growth', status: 'Active', joined: '2024-09-05', lastActive: '2026-04-12', drugCount: 267, batchCount: 398, staffCount: 6, totalTransactions: 9870, address: '17 Sekondi Road, Sekondi' },
  { id: 'PH015', name: 'PharmaPlus Accra', owner: 'Adjoa Boateng', phone: '+233 27 999 0011', email: 'adjoa@pharmaplus.gh', region: 'Greater Accra', plan: 'Scale', status: 'Active', joined: '2024-10-01', lastActive: '2026-04-13', drugCount: 612, batchCount: 945, staffCount: 14, totalTransactions: 34560, address: '2 Airport Road, Accra' },
  { id: 'PH016', name: 'Tema Pharmacy', owner: 'Kojo Asante', phone: '+233 24 100 2003', email: 'kojo@temapharma.gh', region: 'Greater Accra', plan: 'Starter', status: 'Suspended', joined: '2024-04-20', lastActive: '2026-02-28', drugCount: 134, batchCount: 189, staffCount: 4, totalTransactions: 4560, address: '5 Community 1, Tema' },
  { id: 'PH017', name: 'Legon Meds', owner: 'Esi Quaye', phone: '+233 23 200 3004', email: 'esi@legonmeds.gh', region: 'Greater Accra', plan: 'Trial', status: 'Trial', joined: '2026-04-05', lastActive: '2026-04-12', drugCount: 28, batchCount: 35, staffCount: 2, totalTransactions: 95, address: '1 University Road, Legon' },
  { id: 'PH018', name: 'Kumasi Central Pharmacy', owner: 'Osei Bonsu', phone: '+233 26 300 4005', email: 'osei@kumasicentral.gh', region: 'Ashanti', plan: 'Growth', status: 'Active', joined: '2024-11-12', lastActive: '2026-04-11', drugCount: 298, batchCount: 445, staffCount: 7, totalTransactions: 12340, address: '22 Kejetia Market, Kumasi' },
  { id: 'PH019', name: 'Volta Pharma Hub', owner: 'Dela Adzaho', phone: '+233 20 400 5006', email: 'dela@voltapharmahub.gh', region: 'Volta', plan: 'Starter', status: 'Active', joined: '2024-12-01', lastActive: '2026-04-09', drugCount: 103, batchCount: 152, staffCount: 3, totalTransactions: 3780, address: '14 Keta Road, Keta' },
  { id: 'PH020', name: 'Accra North Pharmacy', owner: 'Nii Armah', phone: '+233 27 500 6007', email: 'nii@accranorth.gh', region: 'Greater Accra', plan: 'Trial', status: 'Trial', joined: '2026-04-11', lastActive: '2026-04-13', drugCount: 12, batchCount: 15, staffCount: 1, totalTransactions: 42, address: '9 Achimota Road, Accra' },
  { id: 'PH021', name: 'Eastern Meds', owner: 'Yaa Asantewaa', phone: '+233 24 600 7008', email: 'yaa@easternmeds.gh', region: 'Eastern', plan: 'Starter', status: 'Active', joined: '2025-01-10', lastActive: '2026-04-08', drugCount: 118, batchCount: 174, staffCount: 3, totalTransactions: 4230, address: '7 Nkawkaw Road, Nkawkaw' },
  { id: 'PH022', name: 'Central Pharma', owner: 'Kweku Antwi', phone: '+233 23 700 8009', email: 'kweku@centralpharma.gh', region: 'Central', plan: 'Starter', status: 'Active', joined: '2025-02-14', lastActive: '2026-04-10', drugCount: 94, batchCount: 138, staffCount: 3, totalTransactions: 3120, address: '3 Winneba Road, Winneba' },
  { id: 'PH023', name: 'Tamale Meds', owner: 'Fuseini Mahama', phone: '+233 26 800 9010', email: 'fuseini@talalemeds.gh', region: 'Northern', plan: 'Trial', status: 'Trial', joined: '2026-03-20', lastActive: '2026-04-07', drugCount: 45, batchCount: 62, staffCount: 2, totalTransactions: 230, address: '11 Bolgatanga Road, Tamale' },
  { id: 'PH024', name: 'Osu Pharmacy', owner: 'Akua Sarpong', phone: '+233 20 900 0011', email: 'akua@osupharma.gh', region: 'Greater Accra', plan: 'Growth', status: 'Active', joined: '2025-03-05', lastActive: '2026-04-13', drugCount: 245, batchCount: 367, staffCount: 6, totalTransactions: 8920, address: '6 Oxford Street, Osu, Accra' },
  ];
