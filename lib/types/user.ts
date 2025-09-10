// lib/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  role?: string | null;
  banned?: boolean;
  banReason?: string | null;
  banExpiresAt?: string | null;
}
