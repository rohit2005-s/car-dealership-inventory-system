import { Request } from 'express';

export type Role = 'user' | 'admin';

export interface JwtPayload {
  userId: string;
  role: Role;
}

// Extends Express Request so controllers get typed `req.user` after auth middleware
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface VehicleInput {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface VehicleSearchQuery {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  limit?: string;
}
