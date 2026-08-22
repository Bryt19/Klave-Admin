export type SubStatus = 'Active' | 'Expiring' | 'Overdue' | 'Cancelled';

export interface Subscription {
  id: string;
  pharmacyId: string;
  pharmacyName: string;
  plan: string;
  amount: number;
  billingDate: string;
  status: SubStatus;
  daysUntilRenewal: number;
}

export const subscriptions: Subscription[] = [
  { id: 'SUB001', pharmacyId: 'PH001', pharmacyName: 'Medplus Pharmacy', plan: 'Growth', amount: 850, billingDate: '2026-04-20', status: 'Active', daysUntilRenewal: 7 },
  { id: 'SUB002', pharmacyId: 'PH002', pharmacyName: 'HealthFirst Pharmacy', plan: 'Scale', amount: 1500, billingDate: '2026-04-25', status: 'Active', daysUntilRenewal: 12 },
  { id: 'SUB003', pharmacyId: 'PH003', pharmacyName: 'CarePoint Drugs', plan: 'Starter', amount: 350, billingDate: '2026-04-05', status: 'Overdue', daysUntilRenewal: -8 },
  { id: 'SUB004', pharmacyId: 'PH004', pharmacyName: 'Sunrise Pharmacy', plan: 'Starter', amount: 350, billingDate: '2026-04-28', status: 'Active', daysUntilRenewal: 15 },
  { id: 'SUB006', pharmacyId: 'PH006', pharmacyName: 'Northern Pharma', plan: 'Starter', amount: 350, billingDate: '2026-04-16', status: 'Expiring', daysUntilRenewal: 3 },
  { id: 'SUB007', pharmacyId: 'PH007', pharmacyName: 'GoldCoast Pharmacy', plan: 'Growth', amount: 850, billingDate: '2026-05-01', status: 'Active', daysUntilRenewal: 18 },
  { id: 'SUB008', pharmacyId: 'PH008', pharmacyName: 'Apex Drugs Ltd', plan: 'Scale', amount: 1500, billingDate: '2026-04-30', status: 'Active', daysUntilRenewal: 17 },
  { id: 'SUB010', pharmacyId: 'PH010', pharmacyName: 'Pharmalink GH', plan: 'Growth', amount: 850, billingDate: '2026-04-22', status: 'Active', daysUntilRenewal: 9 },
  { id: 'SUB011', pharmacyId: 'PH011', pharmacyName: 'Brong Meds', plan: 'Starter', amount: 350, billingDate: '2026-04-02', status: 'Overdue', daysUntilRenewal: -11 },
  { id: 'SUB014', pharmacyId: 'PH014', pharmacyName: 'SafeMeds Pharmacy', plan: 'Growth', amount: 850, billingDate: '2026-04-19', status: 'Expiring', daysUntilRenewal: 6 },
  { id: 'SUB015', pharmacyId: 'PH015', pharmacyName: 'PharmaPlus Accra', plan: 'Scale', amount: 1500, billingDate: '2026-05-05', status: 'Active', daysUntilRenewal: 22 },
  { id: 'SUB018', pharmacyId: 'PH018', pharmacyName: 'Kumasi Central Pharmacy', plan: 'Growth', amount: 850, billingDate: '2026-04-27', status: 'Active', daysUntilRenewal: 14 },
  { id: 'SUB019', pharmacyId: 'PH019', pharmacyName: 'Volta Pharma Hub', plan: 'Starter', amount: 350, billingDate: '2026-04-01', status: 'Overdue', daysUntilRenewal: -12 },
  { id: 'SUB021', pharmacyId: 'PH021', pharmacyName: 'Eastern Meds', plan: 'Starter', amount: 350, billingDate: '2026-05-10', status: 'Active', daysUntilRenewal: 27 },
  { id: 'SUB022', pharmacyId: 'PH022', pharmacyName: 'Central Pharma', plan: 'Starter', amount: 350, billingDate: '2026-04-14', status: 'Expiring', daysUntilRenewal: 1 },
  { id: 'SUB024', pharmacyId: 'PH024', pharmacyName: 'Osu Pharmacy', plan: 'Growth', amount: 850, billingDate: '2026-05-05', status: 'Active', daysUntilRenewal: 22 },
  { id: 'SUB012', pharmacyId: 'PH012', pharmacyName: 'QuickCure Pharmacy', plan: 'Starter', amount: 350, billingDate: '2025-12-01', status: 'Cancelled', daysUntilRenewal: -133 },
];

export const mrrData = {
  total: 18400,
  activeCount: 17,
  overdueCount: 3,
  expiringCount: 3,
};
