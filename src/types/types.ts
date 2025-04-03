// src/types/types.ts

import { SupportedLanguage, Language } from '@/translations/supportedLanguages';
import { Order as PrismaOrder } from '@prisma/client';

/**
 * User with associated orders.
 */
export interface UserWithOrders {
  id: number;
  name: string | null;
  email: string | null;
  country: string | null;
  language: Language;
  createdAt: Date;
  orders: Order[];
}

/**
 * User data structure.
 */
export interface User {
  id: number;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  country?: string | null;
  password?: string;
  token?: string | null;
  ip?: string | null;
  currencyCode: string;
  currencySymbol: string;
  exchangeRate: number;
  language: Language;
  createdAt: Date;
  orders?: Order[];
  otp?: Otp;
  referrerId?: number | null;
  referrer?: ReferralUser;
}

/**
 * Referral user data structure.
 */
export interface ReferralUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  password: string;
  referralLink: string;
  couponCode: string;
  createdAt: Date;
  referredUsers: User[];
  passwordReset?: PasswordReset;
  paypalEmail?: string;
  bankName?: string;
  swiftCode?: string;
  accountNumber?: string;
  iban?: string;
  abaRoutingNumber?: string;
  transferCountry?: string;
  transferCity?: string;
  transferPhone?: string;
  recipientName?: string;
  withdrawals?: Withdrawal[];
}

export interface Withdrawal {
  id: number;
  referralUserId: number;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: Date;
  referralUser?: ReferralUser;
}

/**
 * Referral dashboard data structure.
 */
export interface ReferralData {
  couponCode: string;
  referredUsers: UserWithOrders[];
  totalSales: number;
  totalProfit: number;
}

/**
 * Payment intent request structure.
 */
export interface CreatePaymentIntentRequest {
  amount: number;
  bundleName: string;
  email: string;
  quantity: number;
  currency: string;
  isReferredUser?: boolean;
}

/**
 * Password reset structure.
 */
export interface PasswordReset {
  id: number;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  referralUserId: number;
  referralUser?: ReferralUser;
}

/**
 * Exchange rate API response structure.
 */
export interface ExchangeRateApiResponse {
  result: string;
  'error-type'?: string;
  conversion_rates: Record<string, number>;
}

/**
 * Geolocation data structure.
 */
export interface GeolocationData {
  countryCode: string;
  currencyCode: string;
  exchangeRate: number;
  language: Language;
  currencySymbol: string;
  ip: string;
}

/**
 * Bundle data structure.
 */
export interface Bundle {
  id: number;
  name: string;
  friendlyName: string;
  description: string;
  dataAmount: number;
  duration: number;
  price: number;
  autostart: boolean;
  unlimited: boolean;
  imageUrl: string;
  speed: string;
  groups: string[];
  orders?: Order[];
  countries?: CountryInBundle[];
  roamingEnabled: string[];
}

/**
 * Country data structure.
 */
export interface Country {
  id: number;
  iso: string;
  name: string;
  region: string;
  networkBrands: string[];
  orders?: Order[];
  bundles?: BundleWithCountries[];
}

/**
 * Order data structure extending Prisma's Order.
 */
export interface Order extends PrismaOrder {
  bundle?: BundleWithCountries;
  country?: Country;
  user?: User;
  esims?: ESIM[];
  sellPrice: number | null;
}

/**
 * OTP data structure.
 */
export interface Otp {
  id: number;
  otp: string;
  expiry: Date;
  userId: number;
  user?: User;
}

/**
 * ESIM data structure.
 */
export interface ESIM {
  id: number;
  iccid: string;
  smdpAddress: string;
  matchingId: string;
  activationCode: string;
  status?: string;
  orderId: number;
  order?: Order;
}

/**
 * Extended ESIM details.
 */
export interface ESIMDetail extends ESIM {}

/**
 * ESIM details with QR Code.
 */
export interface ESIMDetailWithQRCode extends ESIM {
  qrCodeBase64?: string;
  profileStatus?: string;
  pin?: string;
  puk?: string;
  firstInstalledDateTime?: string;
  appleInstallUrl?: string;
}

/**
 * Generic API error response.
 */
export interface ApiErrorResponse {
  error: string;
}

/**
 * Payment intent response structure.
 */
export interface CreatePaymentIntentResponse {
  clientSecret: string;
  currency: string;
  error?: string;
}

/**
 * Purchase bundles response structure.
 */
export interface PurchaseBundlesResponse {
  orderData: {
    orderReference: string;
  };
  esims: ESIMDetailWithQRCode[];
}

/**
 * Record order response structure.
 */
export interface RecordOrderResponse {
  message: string;
  orderId: number;
}

/**
 * OTP send response structure.
 */
export interface SendOtpResponse {
  success: boolean;
  error?: string;
}

/**
 * OTP verification response structure.
 */
export interface VerifyOtpResponse {
  valid: boolean;
  token?: string;
}

/**
 * ESIM customer reference update response.
 */
export interface UpdateEsimCustomerRefResponse {
  success: boolean;
  error?: string;
}

/**
 * Order email send response structure.
 */
export interface SendOrderEmailResponse {
  success: boolean;
  error?: string;
}

/**
 * Props for the payment form component.
 */
export interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  currency: string;
  bundleName: string;
  email: string;
  quantity: number;
  onPaymentSuccess: () => Promise<void>;
  onBack: () => void;
}

/**
 * Payment method structure.
 */
export interface PaymentMethod {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}

/**
 * Modal properties.
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  country: Country;
  initialBundle?: Bundle;
  referralCode?: string;
}

/**
 * Props for the order item component.
 */
export interface OrderItemProps {
  order: Order;
  userToken: string;
  language: Language;
}

/**
 * Details for a successful transaction.
 */
export interface SuccessDetails {
  email: string;
  bundleDetails: Bundle;
  esimDetails: ESIMDetailWithQRCode[];
  countryName: string;
  orderId: number;
}

/**
 * Props for the success view component.
 */
export interface SuccessViewProps {
  successDetails: SuccessDetails;
  onClose: () => void;
}

/**
 * Types of modals available.
 */
export type ModalType = 'details' | 'history' | 'bundles' | 'location' | 'refresh';

/**
 * Props for the ESIM details modal.
 */
export interface EsimDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  esim: ESIMDetailWithQRCode;
  modalType: ModalType;
  userToken: string;
}

/**
 * Allowed log levels.
 */
export const ALLOWED_LOG_LEVELS = ['info', 'warn', 'error', 'debug'] as const;
export type LogLevel = typeof ALLOWED_LOG_LEVELS[number];

/**
 * OTP input type.
 */
export type OTPInput = string[];

/**
 * Assignments API response structure.
 */
export interface AssignmentsAPIResponse {
  esims: ESIM[];
}

/**
 * GeoPlugin API response structure.
 */
export interface GeoPluginAPIResponse {
  geoplugin_status: number;
  geoplugin_countryCode: string;
  geoplugin_currencyCode: string;
  geoplugin_currencyConverter: string;
}

/**
 * Inventory bundle structure.
 */
export interface InventoryBundle {
  name: string;
  available: {
    remaining: number;
  }[];
}

/**
 * Apply bundle request structure.
 */
export interface ApplyBundleRequest {
  bundles: {
    name: string;
    iccid?: string;
    startTime?: string;
    repeat?: number;
    allowReassign?: boolean;
  }[];
}

/**
 * Verify OTP body structure.
 */
export interface VerifyOtpBody {
  email: string;
  otp: string;
}

/**
 * Network structure.
 */
export interface Network {
  name: string;
  brandName: string;
  speed?: string;
}

/**
 * ESIM details response structure.
 */
export interface EsimDetailsResponse {
  iccid: string;
  matchingId: string;
  smdpAddress: string;
  profileStatus: string;
  pin: string;
  puk: string;
  firstInstalledDateTime: string;
  appleInstallUrl?: string;
}

/**
 * ESIM history event structure.
 */
export interface EsimHistoryEvent {
  name: string;
  date: string;
  bundle?: string;
  alertType?: string;
}

/**
 * ESIM history response structure.
 */
export interface EsimHistoryResponse {
  history: EsimHistoryEvent[];
}

/**
 * ESIM bundle assignment structure.
 */
export interface EsimBundleAssignment {
  id: string;
  callTypeGroup?: string;
  initialQuantity?: number;
  remainingQuantity: number;
  startTime: string;
  endTime?: string;
  bundleState: string;
  assignmentDateTime?: string; // ISO Date string
  assignmentReference?: string;
  unlimited?: boolean;
}

/**
 * ESIM bundle structure.
 */
export interface EsimBundle {
  name: string;
  friendlyName: string;
  assignments: EsimBundleAssignment[];
}

/**
 * ESIM bundles response structure.
 */
export interface EsimBundlesResponse {
  bundles: EsimBundle[];
}

/**
 * ESIM location response structure.
 */
export interface EsimLocationResponse {
  mobileNetworkCode: string;
  networkName: string;
  country: string;
  lastSeen: string; // ISO Date string
}

/**
 * ESIM refresh response structure.
 */
export interface EsimRefreshResponse {
  message: string;
}

/**
 * Union type for various ESIM responses.
 */
export type EsimResponse =
  | EsimDetailsResponse
  | EsimHistoryResponse
  | EsimBundlesResponse
  | EsimLocationResponse
  | EsimRefreshResponse;

/**
 * Reference type for the hero section.
 */
export interface HeroSectionRef {
  focusSearchInput: () => void;
}

/**
 * Coupon structure.
 */
export interface Coupon {
  id: number;
  code: string;
  discountPercent: number;
  sponsor?: string;
  validFrom?: Date;
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Breadcrumb item structure.
 */
export interface BreadcrumbItem {
  name: string;
  href?: string;
}

/**
 * Record order request structure.
 */
export interface RecordOrderRequest {
  email: string;
  bundleName: string;
  amount: number;
  purchasePrice?: number;
  orderReference?: string;
  currency: string;
  paymentIntentId: string;
  country: string;
  quantity: number;
  couponCode?: string;
  discountPercent?: number;
  couponSponsor?: string;
  esims: {
    iccid: string;
    smdpAddress: string;
    matchingId: string;
    activationCode: string;
    status?: string;
  }[];
  referralCode?: string;
  name?: string;
  phone?: string;
}

/**
 * Country within a bundle.
 */
export interface CountryInBundle extends Omit<Country, 'bundles' | 'orders'> {}

/**
 * Bundle with associated countries.
 */
export interface BundleWithCountries extends Omit<Bundle, 'countries' | 'orders'> {
  countries: CountryInBundle[];
}

/**
 * Country with associated bundles.
 */
export interface CountryWithBundles extends Omit<Country, 'bundles' | 'orders'> {
  bundles: BundleWithCountries[];
}

/**
 * Purchase bundles error response structure.
 */
export interface PurchaseBundlesErrorResponse {
  error: string;
}

/**
 * Re-export Language types.
 */
export type { SupportedLanguage, Language };
