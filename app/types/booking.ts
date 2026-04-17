export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  step: number | null;
  old_price?: number | null;
  price_adjustments_since?: string | null;
}

export interface AvailabilityDay {
  date: string;
  times: string[];
}

export interface CheckoutItem {
  id: number;
  name: string;
  price: number;
  old_price?: number | null;
  price_adjustments_since?: string | null;
}

export interface Customer {
  id?: number;
  name: string;
  email: string;
  phone: string;
  birthday?: string | null;
  instagram?: string | null;
  appointments_count?: number;
  total_appointments?: number;
  total_spent?: number;
  is_blocked?: boolean;
}

export interface Appointment {
  id: number;
  date: string;
  time: string;
  name?: string;
  email?: string;
  phone?: string;
  notes?: string | null;
  instagram?: string | null;
  birthday?: string | null;
  edited_duration?: number | null;
  amount?: number | null;
  isPayed?: boolean;
  cancelled?: boolean;
  services?: Service[];
  customer?: Customer | null;
}

export interface PauseTime {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  duration?: number | null;
  name?: string | null;
  customer_id?: number | null;
  user_id?: number | null;
  recurring_type?: string | null;
  recurring_day?: number | null;
  recurring_end_date?: string | null;
}

export interface BusinessHour {
  id?: number;
  day: number;
  from: string;
  to: string;
  off_day: number;
}

export interface Holiday {
  id: number;
  from_date: string;
  to_date: string;
  conflicting_appointments?: Appointment[];
}

export interface AppointmentCreatePayload {
  service_ids: Array<number | string>;
  date: string;
  time: string;
  phone: string;
  email: string;
  name: string;
  instagram?: string;
  birthday?: string;
  notes?: string;
}

export interface RevenueEntry {
  id?: number;
  date?: string;
  amount?: number;
  service_id?: number;
  service_name?: string;
  service?: string;
  name?: string;
}
