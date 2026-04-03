export type UserRole = 'landlord' | 'tenant';
export type OrgRole = 'OWNER' | 'MANAGER' | 'ACCOUNTANT';
export type PropertyType = 'APARTMENT' | 'HOUSE' | 'COMMERCIAL';
export type UnitStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';
export type InvoiceStatus = 'DUE' | 'PAID' | 'PARTIAL' | 'OVERDUE';
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type TenancyStatus = 'ACTIVE' | 'TERMINATED' | 'UPCOMING';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  organisationId?: string;
}

export interface Organisation {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  subscriptionTier: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
}

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  address: string;
  city: string;
  district: string;
  totalUnits: number;
  occupiedUnits: number;
  organisationId: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  type: string;
  monthlyRent: number;
  status: UnitStatus;
  tenantId?: string;
  tenantName?: string;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  unitId?: string;
  unitNumber?: string;
  propertyName?: string;
  paymentStatus: 'CURRENT' | 'LATE' | 'OVERDUE';
  joinedAt: string;
}

export interface Tenancy {
  id: string;
  tenantId: string;
  tenantName: string;
  unitId: string;
  unitNumber: string;
  propertyName: string;
  startDate: string;
  endDate?: string;
  agreedRent: number;
  deposit: number;
  status: TenancyStatus;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  unitId: string;
  unitNumber: string;
  propertyName: string;
  period: string;
  amount: number;
  amountPaid: number;
  balance: number;
  status: InvoiceStatus;
  dueDate: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  unitNumber: string;
  propertyName: string;
  amount: number;
  transactionId: string;
  provider: 'MTN_MOMO' | 'AIRTEL_MONEY' | 'BANK_TRANSFER';
  screenshotUrl?: string;
  status: PaymentStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  paymentId: string;
  invoiceNumber: string;
  tenantName: string;
  unitNumber: string;
  propertyName: string;
  amount: number;
  paidDate: string;
  generatedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: OrgRole;
  status: 'ACTIVE' | 'INVITED';
  joinedAt: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'payment' | 'invoice' | 'tenant' | 'system';
  read: boolean;
  createdAt: string;
}

export interface MaintenanceRequest {
  id: string;
  unitNumber: string;
  propertyName: string;
  tenantName: string;
  issue: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}
