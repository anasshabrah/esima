// src/types/admin.ts

import { User, Country } from './types';

/**
 * Admin user data structure.
 */
export interface AdminUser extends User {
  isAdmin: boolean;
}

/**
 * Audit log data structure.
 */
export interface AuditLog {
  id: number;
  timestamp: string;
  userId?: number;
  user?: AdminUser;
  action: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  details?: string;
}

/**
 * Admin bundle data structure.
 */
export interface AdminBundle {
  id: number;
  name: string;
  description?: string;
  dataAmount: number;
  dataUnit: string;
  duration: number;
  price: number;
  isActive: boolean;
  roamingEnabled: boolean;
  _count?: {
    countries?: number;
  };
  countries?: Country[];
}

/**
 * Form event type
 */
export interface FormEvent extends React.FormEvent<HTMLFormElement> {
  target: HTMLFormElement;
}

/**
 * Input change event type
 */
export interface InputChangeEvent extends React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
}

/**
 * Error state type
 */
export type ErrorState = string | null;

/**
 * Date range filter type
 */
export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Pagination data structure
 */
export interface Pagination {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

/**
 * API response with pagination
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

/**
 * Bundle params type
 */
export interface BundleParams {
  id: string;
}
