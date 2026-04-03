import type {
  Organisation, Property, Unit, Tenant, Tenancy, Invoice, Payment,
  Receipt, TeamMember, AuditLog, Notification, MaintenanceRequest, User
} from '@/types';

export const mockLandlord: User = {
  id: 'u1', name: 'Jean-Pierre Habimana', email: 'jp@bizrent.rw',
  phone: '+250 788 123 456', role: 'landlord', organisationId: 'org1',
};

export const mockTenantUser: User = {
  id: 'u2', name: 'Alice Uwimana', email: 'alice@gmail.com',
  phone: '+250 788 654 321', role: 'tenant',
};

export const mockOrganisation: Organisation = {
  id: 'org1', name: 'Kigali Homes Ltd', email: 'info@kigalihomes.rw',
  phone: '+250 788 000 111', address: 'KN 5 Road, Kigali',
  city: 'Kigali', country: 'Rwanda', subscriptionTier: 'PRO',
};

export const mockProperties: Property[] = [
  { id: 'p1', name: 'Sunrise Apartments', type: 'APARTMENT', address: 'KG 11 Ave', city: 'Kigali', district: 'Gasabo', totalUnits: 24, occupiedUnits: 20, organisationId: 'org1', status: 'ACTIVE', createdAt: '2024-01-15' },
  { id: 'p2', name: 'Green Valley Villas', type: 'HOUSE', address: 'KK 15 Road', city: 'Kigali', district: 'Kicukiro', totalUnits: 8, occupiedUnits: 7, organisationId: 'org1', status: 'ACTIVE', createdAt: '2024-03-20' },
  { id: 'p3', name: 'City Center Plaza', type: 'COMMERCIAL', address: 'KN 3 Street', city: 'Kigali', district: 'Nyarugenge', totalUnits: 12, occupiedUnits: 9, organisationId: 'org1', status: 'ACTIVE', createdAt: '2024-06-10' },
  { id: 'p4', name: 'Nyarutarama Heights', type: 'APARTMENT', address: 'KG 7 Ave', city: 'Kigali', district: 'Gasabo', totalUnits: 16, occupiedUnits: 14, organisationId: 'org1', status: 'ACTIVE', createdAt: '2024-09-01' },
  { id: 'p5', name: 'Kimihurura Residences', type: 'HOUSE', address: 'KG 19 Road', city: 'Kigali', district: 'Gasabo', totalUnits: 6, occupiedUnits: 4, organisationId: 'org1', status: 'INACTIVE', createdAt: '2023-11-05' },
];

export const mockUnits: Unit[] = [
  { id: 'un1', propertyId: 'p1', propertyName: 'Sunrise Apartments', unitNumber: 'A-101', type: '1 Bedroom', monthlyRent: 250000, status: 'OCCUPIED', tenantId: 't1', tenantName: 'Alice Uwimana' },
  { id: 'un2', propertyId: 'p1', propertyName: 'Sunrise Apartments', unitNumber: 'A-102', type: '2 Bedroom', monthlyRent: 400000, status: 'OCCUPIED', tenantId: 't2', tenantName: 'Emmanuel Ndayisaba' },
  { id: 'un3', propertyId: 'p1', propertyName: 'Sunrise Apartments', unitNumber: 'A-103', type: 'Studio', monthlyRent: 180000, status: 'VACANT' },
  { id: 'un4', propertyId: 'p1', propertyName: 'Sunrise Apartments', unitNumber: 'A-201', type: '2 Bedroom', monthlyRent: 420000, status: 'OCCUPIED', tenantId: 't3', tenantName: 'Grace Mukamana' },
  { id: 'un5', propertyId: 'p1', propertyName: 'Sunrise Apartments', unitNumber: 'A-202', type: '3 Bedroom', monthlyRent: 550000, status: 'MAINTENANCE' },
  { id: 'un6', propertyId: 'p2', propertyName: 'Green Valley Villas', unitNumber: 'V-01', type: '3 Bedroom Villa', monthlyRent: 800000, status: 'OCCUPIED', tenantId: 't4', tenantName: 'Patrick Nshimiyimana' },
  { id: 'un7', propertyId: 'p2', propertyName: 'Green Valley Villas', unitNumber: 'V-02', type: '4 Bedroom Villa', monthlyRent: 1200000, status: 'OCCUPIED', tenantId: 't5', tenantName: 'Diane Ingabire' },
  { id: 'un8', propertyId: 'p3', propertyName: 'City Center Plaza', unitNumber: 'S-01', type: 'Retail Shop', monthlyRent: 350000, status: 'OCCUPIED', tenantId: 't6', tenantName: 'Tech Solutions Ltd' },
  { id: 'un9', propertyId: 'p3', propertyName: 'City Center Plaza', unitNumber: 'S-02', type: 'Office Space', monthlyRent: 500000, status: 'VACANT' },
  { id: 'un10', propertyId: 'p4', propertyName: 'Nyarutarama Heights', unitNumber: 'N-101', type: '2 Bedroom', monthlyRent: 450000, status: 'OCCUPIED', tenantId: 't7', tenantName: 'Jean Bosco Mugabo' },
];

export const mockTenants: Tenant[] = [
  { id: 't1', name: 'Alice Uwimana', email: 'alice@gmail.com', phone: '+250 788 654 321', unitId: 'un1', unitNumber: 'A-101', propertyName: 'Sunrise Apartments', paymentStatus: 'CURRENT', joinedAt: '2024-02-01' },
  { id: 't2', name: 'Emmanuel Ndayisaba', email: 'emmanuel@gmail.com', phone: '+250 788 111 222', unitId: 'un2', unitNumber: 'A-102', propertyName: 'Sunrise Apartments', paymentStatus: 'CURRENT', joinedAt: '2024-03-15' },
  { id: 't3', name: 'Grace Mukamana', email: 'grace@gmail.com', phone: '+250 788 333 444', unitId: 'un4', unitNumber: 'A-201', propertyName: 'Sunrise Apartments', paymentStatus: 'LATE', joinedAt: '2024-04-01' },
  { id: 't4', name: 'Patrick Nshimiyimana', email: 'patrick@gmail.com', phone: '+250 788 555 666', unitId: 'un6', unitNumber: 'V-01', propertyName: 'Green Valley Villas', paymentStatus: 'CURRENT', joinedAt: '2024-05-10' },
  { id: 't5', name: 'Diane Ingabire', email: 'diane@gmail.com', phone: '+250 788 777 888', unitId: 'un7', unitNumber: 'V-02', propertyName: 'Green Valley Villas', paymentStatus: 'OVERDUE', joinedAt: '2024-01-20' },
  { id: 't6', name: 'Tech Solutions Ltd', email: 'info@techsolutions.rw', phone: '+250 788 999 000', unitId: 'un8', unitNumber: 'S-01', propertyName: 'City Center Plaza', paymentStatus: 'CURRENT', joinedAt: '2024-07-01' },
  { id: 't7', name: 'Jean Bosco Mugabo', email: 'jbosco@gmail.com', phone: '+250 788 222 333', unitId: 'un10', unitNumber: 'N-101', propertyName: 'Nyarutarama Heights', paymentStatus: 'CURRENT', joinedAt: '2024-10-01' },
];

export const mockTenancies: Tenancy[] = [
  { id: 'tn1', tenantId: 't1', tenantName: 'Alice Uwimana', unitId: 'un1', unitNumber: 'A-101', propertyName: 'Sunrise Apartments', startDate: '2024-02-01', agreedRent: 250000, deposit: 250000, status: 'ACTIVE' },
  { id: 'tn2', tenantId: 't2', tenantName: 'Emmanuel Ndayisaba', unitId: 'un2', unitNumber: 'A-102', propertyName: 'Sunrise Apartments', startDate: '2024-03-15', agreedRent: 400000, deposit: 400000, status: 'ACTIVE' },
  { id: 'tn3', tenantId: 't3', tenantName: 'Grace Mukamana', unitId: 'un4', unitNumber: 'A-201', propertyName: 'Sunrise Apartments', startDate: '2024-04-01', agreedRent: 420000, deposit: 420000, status: 'ACTIVE' },
  { id: 'tn4', tenantId: 't4', tenantName: 'Patrick Nshimiyimana', unitId: 'un6', unitNumber: 'V-01', propertyName: 'Green Valley Villas', startDate: '2024-05-10', agreedRent: 800000, deposit: 800000, status: 'ACTIVE' },
  { id: 'tn5', tenantId: 't5', tenantName: 'Diane Ingabire', unitId: 'un7', unitNumber: 'V-02', propertyName: 'Green Valley Villas', startDate: '2024-01-20', endDate: '2025-01-20', agreedRent: 1200000, deposit: 1200000, status: 'ACTIVE' },
  { id: 'tn6', tenantId: 't6', tenantName: 'Tech Solutions Ltd', unitId: 'un8', unitNumber: 'S-01', propertyName: 'City Center Plaza', startDate: '2024-07-01', agreedRent: 350000, deposit: 700000, status: 'ACTIVE' },
  { id: 'tn7', tenantId: 't7', tenantName: 'Jean Bosco Mugabo', unitId: 'un10', unitNumber: 'N-101', propertyName: 'Nyarutarama Heights', startDate: '2024-10-01', agreedRent: 450000, deposit: 450000, status: 'ACTIVE' },
];

export const mockInvoices: Invoice[] = [
  { id: 'inv1', invoiceNumber: 'INV-2026-001', tenantId: 't1', tenantName: 'Alice Uwimana', unitId: 'un1', unitNumber: 'A-101', propertyName: 'Sunrise Apartments', period: 'April 2026', amount: 250000, amountPaid: 250000, balance: 0, status: 'PAID', dueDate: '2026-04-05', createdAt: '2026-04-01' },
  { id: 'inv2', invoiceNumber: 'INV-2026-002', tenantId: 't2', tenantName: 'Emmanuel Ndayisaba', unitId: 'un2', unitNumber: 'A-102', propertyName: 'Sunrise Apartments', period: 'April 2026', amount: 400000, amountPaid: 200000, balance: 200000, status: 'PARTIAL', dueDate: '2026-04-05', createdAt: '2026-04-01' },
  { id: 'inv3', invoiceNumber: 'INV-2026-003', tenantId: 't3', tenantName: 'Grace Mukamana', unitId: 'un4', unitNumber: 'A-201', propertyName: 'Sunrise Apartments', period: 'April 2026', amount: 420000, amountPaid: 0, balance: 420000, status: 'OVERDUE', dueDate: '2026-04-05', createdAt: '2026-04-01' },
  { id: 'inv4', invoiceNumber: 'INV-2026-004', tenantId: 't4', tenantName: 'Patrick Nshimiyimana', unitId: 'un6', unitNumber: 'V-01', propertyName: 'Green Valley Villas', period: 'April 2026', amount: 800000, amountPaid: 800000, balance: 0, status: 'PAID', dueDate: '2026-04-05', createdAt: '2026-04-01' },
  { id: 'inv5', invoiceNumber: 'INV-2026-005', tenantId: 't5', tenantName: 'Diane Ingabire', unitId: 'un7', unitNumber: 'V-02', propertyName: 'Green Valley Villas', period: 'April 2026', amount: 1200000, amountPaid: 0, balance: 1200000, status: 'OVERDUE', dueDate: '2026-04-05', createdAt: '2026-04-01' },
  { id: 'inv6', invoiceNumber: 'INV-2026-006', tenantId: 't6', tenantName: 'Tech Solutions Ltd', unitId: 'un8', unitNumber: 'S-01', propertyName: 'City Center Plaza', period: 'April 2026', amount: 350000, amountPaid: 0, balance: 350000, status: 'DUE', dueDate: '2026-04-10', createdAt: '2026-04-01' },
  { id: 'inv7', invoiceNumber: 'INV-2026-007', tenantId: 't7', tenantName: 'Jean Bosco Mugabo', unitId: 'un10', unitNumber: 'N-101', propertyName: 'Nyarutarama Heights', period: 'April 2026', amount: 450000, amountPaid: 450000, balance: 0, status: 'PAID', dueDate: '2026-04-05', createdAt: '2026-04-01' },
  { id: 'inv8', invoiceNumber: 'INV-2026-008', tenantId: 't1', tenantName: 'Alice Uwimana', unitId: 'un1', unitNumber: 'A-101', propertyName: 'Sunrise Apartments', period: 'March 2026', amount: 250000, amountPaid: 250000, balance: 0, status: 'PAID', dueDate: '2026-03-05', createdAt: '2026-03-01' },
];

export const mockPayments: Payment[] = [
  { id: 'pay1', invoiceId: 'inv1', invoiceNumber: 'INV-2026-001', tenantId: 't1', tenantName: 'Alice Uwimana', unitNumber: 'A-101', propertyName: 'Sunrise Apartments', amount: 250000, transactionId: 'MOMO-78291034', provider: 'MTN_MOMO', status: 'APPROVED', submittedAt: '2026-04-02', reviewedAt: '2026-04-02', reviewedBy: 'Jean-Pierre Habimana' },
  { id: 'pay2', invoiceId: 'inv2', invoiceNumber: 'INV-2026-002', tenantId: 't2', tenantName: 'Emmanuel Ndayisaba', unitNumber: 'A-102', propertyName: 'Sunrise Apartments', amount: 200000, transactionId: 'MOMO-98347261', provider: 'MTN_MOMO', status: 'APPROVED', submittedAt: '2026-04-03', reviewedAt: '2026-04-03', reviewedBy: 'Jean-Pierre Habimana' },
  { id: 'pay3', invoiceId: 'inv4', invoiceNumber: 'INV-2026-004', tenantId: 't4', tenantName: 'Patrick Nshimiyimana', unitNumber: 'V-01', propertyName: 'Green Valley Villas', amount: 800000, transactionId: 'MOMO-45128390', provider: 'MTN_MOMO', status: 'APPROVED', submittedAt: '2026-04-01', reviewedAt: '2026-04-01', reviewedBy: 'Jean-Pierre Habimana' },
  { id: 'pay4', invoiceId: 'inv7', invoiceNumber: 'INV-2026-007', tenantId: 't7', tenantName: 'Jean Bosco Mugabo', unitNumber: 'N-101', propertyName: 'Nyarutarama Heights', amount: 450000, transactionId: 'AIRTEL-67382910', provider: 'AIRTEL_MONEY', status: 'APPROVED', submittedAt: '2026-04-02', reviewedAt: '2026-04-02', reviewedBy: 'Jean-Pierre Habimana' },
  { id: 'pay5', invoiceId: 'inv6', invoiceNumber: 'INV-2026-006', tenantId: 't6', tenantName: 'Tech Solutions Ltd', unitNumber: 'S-01', propertyName: 'City Center Plaza', amount: 350000, transactionId: 'MOMO-11294857', provider: 'MTN_MOMO', status: 'PENDING', submittedAt: '2026-04-03' },
  { id: 'pay6', invoiceId: 'inv3', invoiceNumber: 'INV-2026-003', tenantId: 't3', tenantName: 'Grace Mukamana', unitNumber: 'A-201', propertyName: 'Sunrise Apartments', amount: 420000, transactionId: 'MOMO-99281734', provider: 'MTN_MOMO', status: 'PENDING', submittedAt: '2026-04-03' },
  { id: 'pay7', invoiceId: 'inv5', invoiceNumber: 'INV-2026-005', tenantId: 't5', tenantName: 'Diane Ingabire', unitNumber: 'V-02', propertyName: 'Green Valley Villas', amount: 500000, transactionId: 'MOMO-33847291', provider: 'MTN_MOMO', status: 'REJECTED', rejectionReason: 'Transaction ID does not match MoMo records. Please resubmit with correct transaction ID.', submittedAt: '2026-04-02', reviewedAt: '2026-04-02', reviewedBy: 'Jean-Pierre Habimana' },
];

export const mockReceipts: Receipt[] = [
  { id: 'r1', receiptNumber: 'RCT-2026-001', paymentId: 'pay1', invoiceNumber: 'INV-2026-001', tenantName: 'Alice Uwimana', unitNumber: 'A-101', propertyName: 'Sunrise Apartments', amount: 250000, paidDate: '2026-04-02', generatedAt: '2026-04-02' },
  { id: 'r2', receiptNumber: 'RCT-2026-002', paymentId: 'pay2', invoiceNumber: 'INV-2026-002', tenantName: 'Emmanuel Ndayisaba', unitNumber: 'A-102', propertyName: 'Sunrise Apartments', amount: 200000, paidDate: '2026-04-03', generatedAt: '2026-04-03' },
  { id: 'r3', receiptNumber: 'RCT-2026-003', paymentId: 'pay3', invoiceNumber: 'INV-2026-004', tenantName: 'Patrick Nshimiyimana', unitNumber: 'V-01', propertyName: 'Green Valley Villas', amount: 800000, paidDate: '2026-04-01', generatedAt: '2026-04-01' },
  { id: 'r4', receiptNumber: 'RCT-2026-004', paymentId: 'pay4', invoiceNumber: 'INV-2026-007', tenantName: 'Jean Bosco Mugabo', unitNumber: 'N-101', propertyName: 'Nyarutarama Heights', amount: 450000, paidDate: '2026-04-02', generatedAt: '2026-04-02' },
];

export const mockTeamMembers: TeamMember[] = [
  { id: 'tm1', name: 'Jean-Pierre Habimana', email: 'jp@bizrent.rw', role: 'OWNER', status: 'ACTIVE', joinedAt: '2024-01-01' },
  { id: 'tm2', name: 'Marie Claire Uwase', email: 'marie@bizrent.rw', role: 'MANAGER', status: 'ACTIVE', joinedAt: '2024-06-15' },
  { id: 'tm3', name: 'Eric Nsengimana', email: 'eric@bizrent.rw', role: 'ACCOUNTANT', status: 'ACTIVE', joinedAt: '2024-09-01' },
  { id: 'tm4', name: 'Sandrine Iradukunda', email: 'sandrine@bizrent.rw', role: 'MANAGER', status: 'INVITED', joinedAt: '2026-04-01' },
];

export const mockAuditLogs: AuditLog[] = [
  { id: 'al1', actor: 'Jean-Pierre Habimana', action: 'APPROVED_PAYMENT', target: 'Payment MOMO-78291034', details: 'Approved RWF 250,000 from Alice Uwimana', timestamp: '2026-04-02T10:30:00Z' },
  { id: 'al2', actor: 'Jean-Pierre Habimana', action: 'REJECTED_PAYMENT', target: 'Payment MOMO-33847291', details: 'Rejected RWF 500,000 from Diane Ingabire — Transaction ID mismatch', timestamp: '2026-04-02T11:15:00Z' },
  { id: 'al3', actor: 'Marie Claire Uwase', action: 'GENERATED_INVOICE', target: 'INV-2026-001 to INV-2026-007', details: 'Bulk generated 7 invoices for April 2026', timestamp: '2026-04-01T08:00:00Z' },
  { id: 'al4', actor: 'Jean-Pierre Habimana', action: 'ADDED_PROPERTY', target: 'Nyarutarama Heights', details: 'Added new apartment property with 16 units', timestamp: '2024-09-01T09:00:00Z' },
  { id: 'al5', actor: 'Eric Nsengimana', action: 'GENERATED_RECEIPT', target: 'RCT-2026-001', details: 'Generated receipt for Alice Uwimana', timestamp: '2026-04-02T10:35:00Z' },
  { id: 'al6', actor: 'Jean-Pierre Habimana', action: 'INVITED_MEMBER', target: 'Sandrine Iradukunda', details: 'Invited as Manager role', timestamp: '2026-04-01T14:00:00Z' },
  { id: 'al7', actor: 'System', action: 'OVERDUE_ALERT', target: 'INV-2026-003, INV-2026-005', details: '2 invoices marked as OVERDUE', timestamp: '2026-04-06T00:00:00Z' },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', title: 'New Payment Submitted', message: 'Tech Solutions Ltd submitted RWF 350,000 for April rent', type: 'payment', read: false, createdAt: '2026-04-03T14:30:00Z' },
  { id: 'n2', title: 'New Payment Submitted', message: 'Grace Mukamana submitted RWF 420,000 for April rent', type: 'payment', read: false, createdAt: '2026-04-03T12:00:00Z' },
  { id: 'n3', title: 'Invoice Overdue', message: 'INV-2026-005 for Diane Ingabire is now overdue', type: 'invoice', read: false, createdAt: '2026-04-06T00:00:00Z' },
  { id: 'n4', title: 'Payment Approved', message: 'Payment MOMO-78291034 from Alice Uwimana approved', type: 'payment', read: true, createdAt: '2026-04-02T10:30:00Z' },
  { id: 'n5', title: 'New Tenant Registered', message: 'Jean Bosco Mugabo joined via invite link', type: 'tenant', read: true, createdAt: '2024-10-01T09:00:00Z' },
];

export const mockMaintenanceRequests: MaintenanceRequest[] = [
  { id: 'm1', unitNumber: 'A-202', propertyName: 'Sunrise Apartments', tenantName: 'N/A', issue: 'Leaking bathroom pipe', priority: 'HIGH', status: 'OPEN', createdAt: '2026-04-01' },
  { id: 'm2', unitNumber: 'V-01', propertyName: 'Green Valley Villas', tenantName: 'Patrick Nshimiyimana', issue: 'Air conditioning not working', priority: 'MEDIUM', status: 'IN_PROGRESS', createdAt: '2026-03-28' },
  { id: 'm3', unitNumber: 'A-101', propertyName: 'Sunrise Apartments', tenantName: 'Alice Uwimana', issue: 'Kitchen tap replacement', priority: 'LOW', status: 'RESOLVED', createdAt: '2026-03-15' },
  { id: 'm4', unitNumber: 'S-01', propertyName: 'City Center Plaza', tenantName: 'Tech Solutions Ltd', issue: 'Electrical outlet malfunction', priority: 'URGENT', status: 'OPEN', createdAt: '2026-04-02' },
];

// Dashboard chart data
export const weeklyRevenueData = [
  { name: 'Mon', amount: 450000 },
  { name: 'Tue', amount: 1250000 },
  { name: 'Wed', amount: 800000 },
  { name: 'Thu', amount: 350000 },
  { name: 'Fri', amount: 0 },
  { name: 'Sat', amount: 0 },
  { name: 'Sun', amount: 0 },
];

export const paymentStatusData = [
  { name: 'Paid', value: 3, fill: 'hsl(160, 84%, 39%)' },
  { name: 'Partial', value: 1, fill: 'hsl(38, 92%, 50%)' },
  { name: 'Overdue', value: 2, fill: 'hsl(0, 79%, 50%)' },
  { name: 'Due', value: 1, fill: 'hsl(222, 72%, 48%)' },
];

export const formatRWF = (amount: number): string => {
  return `RWF ${amount.toLocaleString('en-US')}`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};
