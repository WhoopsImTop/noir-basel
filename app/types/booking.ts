export interface StaffEmployee {
  id: number;
  name: string;
  display_name?: string | null;
  staff_name?: string;
  photo_url?: string | null;
  email?: string;
  role?: string;
  is_active?: boolean;
  can_edit_appointments?: boolean;
  can_cancel_appointments?: boolean;
  services?: Service[];
  business_hours?: EmployeeBusinessHour[];
}

export interface EmployeeBusinessHour {
  id?: number;
  user_id?: number;
  day: string;
  from?: string | null;
  to?: string | null;
  off_day?: boolean | number;
}

export interface ServiceCategory {
  id: number;
  name: string;
  sort_order: number;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  step: number | null;
  category_id?: number | null;
  category?: ServiceCategory | null;
  old_price?: number | null;
  price_adjustments_since?: string | null;
  employees?: StaffEmployee[];
}

export interface AvailabilityDay {
  date: string;
  day?: string;
  times: string[];
}

export interface AvailabilityResponse {
  dates: AvailabilityDay[];
  cart?: Array<{ name: string; price: number; step: number }>;
  employees?: StaffEmployee[];
  suggested_employee_id?: number | null;
  employee_id?: number | null;
  message?: string;
}

export interface CheckoutItem {
  id?: number | null;
  name: string;
  price: number;
  old_price?: number | null;
  price_adjustments_since?: string | null;
  step?: number | null;
}

export interface CheckoutResponse {
  items: CheckoutItem[];
  subtotal?: number;
  discount?: number;
  total?: number;
  voucher?: { code: string; name: string } | null;
}

export interface Voucher {
  id: number;
  code: string;
  name: string;
  type: "percent" | "fixed";
  value: number;
  min_cart_total?: number | null;
  max_discount?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
  max_redemptions_total?: number | null;
  max_redemptions_per_customer?: number | null;
  service_ids?: number[] | null;
  is_active: boolean;
  redemptions_count?: number;
}

export interface VoucherValidationResult {
  valid: boolean;
  code: string;
  voucher_name: string;
  items: CheckoutItem[];
  subtotal: number;
  discount: number;
  total: number;
  discount_label: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CustomerDetails {
  phone?: string | null;
  birthday?: string | null;
  instagram?: string | null;
  notes?: string | null;
}

export interface Customer {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  created_at?: string;
  comment?: string | null;
  birthday?: string | null;
  instagram?: string | null;
  customer_details?: CustomerDetails | null;
  appointments_count?: number;
  completed_appointments_count?: number;
  total_appointments?: number;
  total_spent?: number;
  is_blocked?: boolean;
  isBlocked?: boolean;
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
  cancelled_at?: string;
  employee_id?: number | null;
  employee?: StaffEmployee | null;
  services?: Service[];
  customer?: Customer | null;
  type?: string;
  loading?: boolean;
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
  type?: string;
  instance?: number;
}

export interface BusinessHour {
  id?: number;
  day: number | string;
  from: string;
  to: string;
  off_day: number | boolean;
}

export interface Holiday {
  id: number;
  date?: string;
  from_date?: string;
  to_date?: string;
  user_id?: number | null;
  status?: "pending" | "approved" | "rejected" | string;
  note?: string | null;
  user?: StaffEmployee | null;
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
  voucher_code?: string;
  locale?: string;
  employee_id?: number;
}

export interface RescheduleService {
  id: number;
  name: string;
  price: number;
  step: number;
}

export interface ReschedulePreview {
  id: number;
  date: string;
  time: string;
  employee_id?: number | null;
  services: RescheduleService[];
  customer?: {
    name: string;
    email: string;
  };
}

export interface ReschedulePreviewResponse {
  appointment: ReschedulePreview;
  available_times: Record<string, string[]>;
  employees?: StaffEmployee[];
  employee_id?: number | null;
  suggested_employee_id?: number | null;
}

export interface RescheduleSubmitResponse {
  message: string;
  appointment: {
    id: number;
    date: string;
    time: string;
    old_date: string;
    old_time: string;
  };
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
