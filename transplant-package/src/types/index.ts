export interface Batch {
  id: string;
  batchNumber?: string;
  batchNo?: string;
  quantity: number;
  expiry: string;
  expiryDate?: string;
  supplier: string;
  status: 'In Stock' | 'Low Stock' | 'Expiring Soon' | 'Out of Stock';
  unitPrice?: number;
  costPrice?: number;
}

export interface Drug {
  id: string;
  name: string;
  category: string;
  categories: string[];
  dosageForm: string;
  strength: string;
  manufacturer: string;
  description?: string;
  unitPrice: number;
  batches: Batch[];
  lowStockThreshold?: number;
  totalQuantity?: number;
  status?: 'In Stock' | 'Low Stock' | 'Out of Stock';
  isExpiringSoon?: boolean;
  isControlled?: boolean;
}

export interface EnrichedDrugBatch {
  batchId: string;
  batchNumber: string;
  expiryDate?: string;
  quantity: number;
  priceAtSale?: number;
}

export interface EnrichedDrugLine {
  drugId: string;
  drugName: string;
  category?: string;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  unitPrice: number;
  totalAmount: number;
  batches: EnrichedDrugBatch[];
}

export interface Transaction {
  id: string;
  type: 'Sale' | 'Restock' | 'Reconciliation' | 'Edit';
  drugId: string;
  drugName: string;
  batchId: string;
  batchExpiry: string;
  quantity: number;
  unitPrice?: number;
  totalAmount?: number;
  costPrice?: number;
  profit?: number;
  staffId: string;
  staffName: string;
  timestamp: string;
  stockBefore: number;
  stockAfter: number;
  pharmacyId: string;
  notes?: string;
  sale_type?: string;
  amount_tendered?: number;
  payment_reference?: string;
  insurance_provider?: string;
  insurance_number?: string;
  _items?: any[];
  _totalQty?: number;
  drugLines?: EnrichedDrugLine[];
}

export type Role = 'OWNER' | 'STAFF' | 'MANAGER' | 'PHARMACIST' | 'CASHIER';


export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  pharmacyId: string;
  pharmacyName: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  subscriptionExpiresAt?: string;
  isDeactivated?: boolean;
  isDeleted?: boolean;
  requiresPasswordChange?: boolean;
  allowDispensingExpired?: boolean;
}

export interface Staff {
  id: string;
  name: string;
  email?: string;
  pin?: string;
  color: string;
  initials: string;
  lastActive: string;
  role: Role;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  ownerEmail: string;
  ownerPassword?: string;
  allowDispensingExpired?: boolean;
}

export interface BasketItem {
  drug_id: string;
  drug_name: string;
  batch_id: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  isControlled?: boolean;
  isExpired?: boolean;
}

export interface FailedItem {
  drugId: string;
  batchId: string;
  availableStock: number;
}

export interface HeldCart {
  id: string;
  timestamp: number;
  items: BasketItem[];
  notes?: string;
  label: string;
}

