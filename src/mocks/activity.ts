export type MovementType = 'Sale' | 'Restock' | 'Reversal' | 'Reconciliation';

export interface ActivityEntry {
  id: string;
  pharmacyId: string;
  pharmacyName: string;
  drugName: string;
  movement: MovementType;
  quantity: number;
  staffName: string;
  timestamp: string;
}

export const activityFeed: ActivityEntry[] = [
  { id: 'ACT001', pharmacyId: 'PH015', pharmacyName: 'PharmaPlus Accra', drugName: 'Amoxicillin 500mg', movement: 'Sale', quantity: 30, staffName: 'Ama Darko', timestamp: '2026-04-13T08:12:00' },
  { id: 'ACT002', pharmacyId: 'PH001', pharmacyName: 'Medplus Pharmacy', drugName: 'Paracetamol 1000mg', movement: 'Restock', quantity: 500, staffName: 'Kwame Asante', timestamp: '2026-04-13T08:05:00' },
  { id: 'ACT003', pharmacyId: 'PH010', pharmacyName: 'Pharmalink GH', drugName: 'Metformin 850mg', movement: 'Sale', quantity: 60, staffName: 'Abena Tetteh', timestamp: '2026-04-13T07:58:00' },
  { id: 'ACT004', pharmacyId: 'PH002', pharmacyName: 'HealthFirst Pharmacy', drugName: 'Ciprofloxacin 250mg', movement: 'Sale', quantity: 14, staffName: 'Kofi Mensah', timestamp: '2026-04-13T07:45:00' },
  { id: 'ACT005', pharmacyId: 'PH024', pharmacyName: 'Osu Pharmacy', drugName: 'Ibuprofen 400mg', movement: 'Restock', quantity: 200, staffName: 'Akua Sarpong', timestamp: '2026-04-13T07:30:00' },
  { id: 'ACT006', pharmacyId: 'PH007', pharmacyName: 'GoldCoast Pharmacy', drugName: 'Artemether 20mg', movement: 'Sale', quantity: 6, staffName: 'Esi Acheampong', timestamp: '2026-04-13T07:22:00' },
  { id: 'ACT007', pharmacyId: 'PH008', pharmacyName: 'Apex Drugs Ltd', drugName: 'Omeprazole 20mg', movement: 'Reversal', quantity: 10, staffName: 'Yaw Darko', timestamp: '2026-04-13T07:15:00' },
  { id: 'ACT008', pharmacyId: 'PH018', pharmacyName: 'Kumasi Central Pharmacy', drugName: 'Amlodipine 5mg', movement: 'Sale', quantity: 30, staffName: 'Adwoa Bonsu', timestamp: '2026-04-13T07:08:00' },
  { id: 'ACT009', pharmacyId: 'PH015', pharmacyName: 'PharmaPlus Accra', drugName: 'Lisinopril 10mg', movement: 'Reconciliation', quantity: 45, staffName: 'Adjoa Boateng', timestamp: '2026-04-13T06:55:00' },
  { id: 'ACT010', pharmacyId: 'PH004', pharmacyName: 'Sunrise Pharmacy', drugName: 'Azithromycin 500mg', movement: 'Sale', quantity: 3, staffName: 'Ama Owusu', timestamp: '2026-04-13T06:40:00' },
  { id: 'ACT011', pharmacyId: 'PH001', pharmacyName: 'Medplus Pharmacy', drugName: 'Diclofenac 50mg', movement: 'Sale', quantity: 20, staffName: 'Nana Asante', timestamp: '2026-04-12T17:55:00' },
  { id: 'ACT012', pharmacyId: 'PH002', pharmacyName: 'HealthFirst Pharmacy', drugName: 'Atorvastatin 40mg', movement: 'Restock', quantity: 300, staffName: 'Efua Mensah', timestamp: '2026-04-12T17:30:00' },
  { id: 'ACT013', pharmacyId: 'PH014', pharmacyName: 'SafeMeds Pharmacy', drugName: 'Metronidazole 400mg', movement: 'Sale', quantity: 21, staffName: 'Kwabena Osei', timestamp: '2026-04-12T17:10:00' },
  { id: 'ACT014', pharmacyId: 'PH010', pharmacyName: 'Pharmalink GH', drugName: 'Salbutamol Inhaler', movement: 'Sale', quantity: 2, staffName: 'Kojo Tetteh', timestamp: '2026-04-12T16:45:00' },
  { id: 'ACT015', pharmacyId: 'PH007', pharmacyName: 'GoldCoast Pharmacy', drugName: 'Doxycycline 100mg', movement: 'Restock', quantity: 150, staffName: 'Nana Acheampong', timestamp: '2026-04-12T16:20:00' },
  { id: 'ACT016', pharmacyId: 'PH008', pharmacyName: 'Apex Drugs Ltd', drugName: 'Tramadol 50mg', movement: 'Reconciliation', quantity: 100, staffName: 'Yaw Darko', timestamp: '2026-04-12T15:55:00' },
  { id: 'ACT017', pharmacyId: 'PH024', pharmacyName: 'Osu Pharmacy', drugName: 'Cetirizine 10mg', movement: 'Sale', quantity: 15, staffName: 'Akua Sarpong', timestamp: '2026-04-12T15:30:00' },
  { id: 'ACT018', pharmacyId: 'PH018', pharmacyName: 'Kumasi Central Pharmacy', drugName: 'Fluconazole 150mg', movement: 'Sale', quantity: 4, staffName: 'Osei Bonsu', timestamp: '2026-04-12T15:05:00' },
  { id: 'ACT019', pharmacyId: 'PH015', pharmacyName: 'PharmaPlus Accra', drugName: 'Losartan 50mg', movement: 'Restock', quantity: 400, staffName: 'Ama Boateng', timestamp: '2026-04-12T14:40:00' },
  { id: 'ACT020', pharmacyId: 'PH001', pharmacyName: 'Medplus Pharmacy', drugName: 'Ceftriaxone 1g', movement: 'Reversal', quantity: 5, staffName: 'Kwame Asante', timestamp: '2026-04-12T14:15:00' },
  { id: 'ACT021', pharmacyId: 'PH004', pharmacyName: 'Sunrise Pharmacy', drugName: 'Vitamin C 1000mg', movement: 'Sale', quantity: 50, staffName: 'Ama Owusu', timestamp: '2026-04-12T13:50:00' },
  { id: 'ACT022', pharmacyId: 'PH002', pharmacyName: 'HealthFirst Pharmacy', drugName: 'Insulin Glargine', movement: 'Sale', quantity: 2, staffName: 'Kofi Mensah', timestamp: '2026-04-12T13:25:00' },
  { id: 'ACT023', pharmacyId: 'PH006', pharmacyName: 'Northern Pharma', drugName: 'Chloroquine 250mg', movement: 'Restock', quantity: 200, staffName: 'Ibrahim Alhassan', timestamp: '2026-04-12T13:00:00' },
  { id: 'ACT024', pharmacyId: 'PH014', pharmacyName: 'SafeMeds Pharmacy', drugName: 'Prednisolone 5mg', movement: 'Sale', quantity: 28, staffName: 'Adjoa Osei', timestamp: '2026-04-12T12:35:00' },
  { id: 'ACT025', pharmacyId: 'PH010', pharmacyName: 'Pharmalink GH', drugName: 'Folic Acid 5mg', movement: 'Sale', quantity: 60, staffName: 'Abena Tetteh', timestamp: '2026-04-12T12:10:00' },
];

export const signupChartData = [
  { week: 'W1 Jan', signups: 1 },
  { week: 'W2 Jan', signups: 2 },
  { week: 'W3 Jan', signups: 0 },
  { week: 'W4 Jan', signups: 3 },
  { week: 'W1 Feb', signups: 1 },
  { week: 'W2 Feb', signups: 2 },
  { week: 'W3 Feb', signups: 4 },
  { week: 'W4 Feb', signups: 2 },
  { week: 'W1 Mar', signups: 3 },
  { week: 'W2 Mar', signups: 5 },
  { week: 'W3 Mar', signups: 2 },
  { week: 'W4 Mar', signups: 4 },
];
