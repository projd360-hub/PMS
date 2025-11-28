
export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  HOLD = 'HOLD',
  CANCELLED = 'CANCELLED',
  BLOCKED = 'BLOCKED' // Admin block / Maintenance
}

export enum RoomType {
  SINGLE = 'Single',
  DOUBLE = 'Double',
  SUITE = 'Suite',
  DELUXE = 'Deluxe',
  // New types
  KING = 'King Size',
  DELUXE_QUEEN = 'Deluxe Queen',
  DELUXE_KING = 'Deluxe King',
  QUEEN = 'Queen Size'
}

export interface Guest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  idProofNumber?: string; // Passport or ID
  idProofType?: string;
  notes?: string;
}

export interface TravelAgency {
  name: string;
  agentName?: string;
  contact?: string; // Phone
  email?: string;
  commissionRate?: number;
  gstNumber?: string;
}

export interface Booking {
  id: string;
  roomId: string;
  guestId: string;
  guest?: Guest;
  checkInDate: string; // ISO Date string YYYY-MM-DD
  checkOutDate: string; // ISO Date string YYYY-MM-DD
  checkInTime?: string; // HH:mm
  checkOutTime?: string; // HH:mm
  status: BookingStatus;
  
  // Financials
  totalAmount: number;
  paidAmount: number;
  taxAmount?: number;
  discountAmount?: number;
  paymentMethod?: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'OTA' | 'UPI';
  transactionId?: string; // For digital payments
  
  // Details
  travelAgency?: TravelAgency;
  adults: number;
  children: number;
  infants?: number;
  color?: string; // For UI visualization
  source?: 'WALK_IN' | 'WEB' | 'OTA' | 'PHONE';
  
  // Advanced Details (New)
  bookingType?: 'FIT' | 'CORPORATE' | 'GROUP' | 'TA';
  mealPlan?: 'EP' | 'CP' | 'MAP' | 'AP';
  ratePlan?: string;
  billingPreferences?: {
    roomCharges: 'GUEST' | 'COMPANY' | 'AGENT';
    extras: 'GUEST' | 'COMPANY' | 'AGENT';
  };
  inclusions?: string[];
  specialInstructions?: string;
  internalNotes?: string;
  
  // Meta
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  pricePerNight: number;
  status: 'CLEAN' | 'DIRTY' | 'MAINTENANCE';
  amenities: string[];
  capacity: number;
}

export interface DateCellClickEvent {
  roomId: string;
  date: string;
  x: number;
  y: number;
}
