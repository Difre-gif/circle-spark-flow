export type UserRole = 'landlord' | 'tenant' | 'super-admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  organisationId?: string;
}
