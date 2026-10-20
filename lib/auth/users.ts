export interface NenisUser {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: 'neni' | 'admin';
  businessName: string;
  businessCategory: string;
  graduationLevel: 'Starter' | 'Growth' | 'Trusted';
  creditLimit: number;
  availableCredit: number;
  joinedDate: string;
}

export const SEED_USERS: NenisUser[] = [
  {
    id: 'usr_neni_001',
    email: 'ana@nenisclub.mx',
    password: 'password123',
    name: 'Ana Rodríguez',
    role: 'neni',
    businessName: 'Boutique Luna Chic',
    businessCategory: 'Moda & Accesorios',
    graduationLevel: 'Growth',
    creditLimit: 15000,
    availableCredit: 11800,
    joinedDate: '2024-03-15',
  },
  {
    id: 'usr_neni_002',
    email: 'karla@nenisclub.mx',
    password: 'password123',
    name: 'Karla Gómez',
    role: 'neni',
    businessName: 'Dulce Canela Repostería',
    businessCategory: 'Alimentos & Postres',
    graduationLevel: 'Trusted',
    creditLimit: 30000,
    availableCredit: 27500,
    joinedDate: '2023-11-10',
  },
  {
    id: 'usr_neni_003',
    email: 'sofia@nenisclub.mx',
    password: 'password123',
    name: 'Sofía Luna',
    role: 'neni',
    businessName: 'Botanika Skincare',
    businessCategory: 'Belleza & Cuidado Personal',
    graduationLevel: 'Starter',
    creditLimit: 6000,
    availableCredit: 6000,
    joinedDate: '2026-08-01',
  },
  {
    id: 'usr_admin_001',
    email: 'admin@nenisclub.mx',
    password: 'password123',
    name: 'Valeria Directora',
    role: 'admin',
    businessName: 'Nenis Club Operaciones',
    businessCategory: 'Finanzas & Cartera',
    graduationLevel: 'Trusted',
    creditLimit: 100000,
    availableCredit: 100000,
    joinedDate: '2023-01-01',
  },
];

export function validateUserCredentials(email: string, password: string): Omit<NenisUser, 'password'> | null {
  const normalizedEmail = email.trim().toLowerCase();
  const user = SEED_USERS.find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
  );

  if (!user) return null;

  // Devolver el usuario sin la contraseña sensible
  const { password: _, ...userSafe } = user;
  return userSafe;
}
