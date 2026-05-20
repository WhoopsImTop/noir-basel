import type {
  Appointment,
  AppointmentCreatePayload,
  AvailabilityDay,
  BusinessHour,
  CheckoutItem,
  CheckoutResponse,
  Customer,
  Voucher,
  VoucherValidationResult,
  Holiday,
  PauseTime,
  RevenueEntry,
  Service,
  ServiceCategory,
} from "~/types/booking";
import { apiRequest, toCsv } from "~/utils/api";

interface SettingsResponse {
  [key: string]: string | number | null;
}

export interface PriceAdjustment {
  id: number;
  start_date: string;
  end_date: string;
  price: number;
  services_id?: number;
  service_id?: number;
}

export interface PopularService {
  id: number;
  name: string;
  bookings_count: number;
}

export interface RevenueReport {
  weekly_revenue?: Record<string, number>;
  total_bookings?: number;
  total_possible_bookings?: number;
  popular_services?: PopularService[];
  gross?: number;
  tax?: number;
  revenue_until_today?: number;
  new_customers_last_month?: number;
  new_customers_this_month?: number;
  customer_growth_rate?: number;
  [key: string]: unknown;
}

export interface HolidayCreateResponse {
  holidays?: Holiday[];
  conflicting_appointments?: Appointment[];
}

export const useBookingApi = () => {
  const getServices = (auth = false) => apiRequest<Service[]>("/service", { auth });
  const getService = (id: number | string) => apiRequest<Service>(`/service/${id}`, { auth: true });
  const createService = (payload: Partial<Service>) =>
    apiRequest<Service>("/service", { method: "POST", body: payload, auth: true });
  const updateService = (id: number | string, payload: Partial<Service>) =>
    apiRequest<Service>(`/service/${id}`, { method: "PATCH", body: payload, auth: true });
  const deleteService = (id: number | string) =>
    apiRequest<{ success?: boolean; message?: string }>(`/service/${id}`, { method: "DELETE", auth: true });

  const getSettings = (keys: string[], auth = false) =>
    apiRequest<SettingsResponse>(`/v2/settings?keys=${encodeURIComponent(keys.join(","))}`, { auth });

  const updateSetting = (key: string, value: string | number) =>
    apiRequest<SettingsResponse>("/v2/settings", {
      method: "POST",
      body: { key, value },
      auth: true,
    });

  const getPriceAdjustments = (serviceId: number | string) =>
    apiRequest<PriceAdjustment | PriceAdjustment[]>(`/price-adjustments/${serviceId}`, { auth: true });

  const createPriceAdjustment = (payload: Record<string, unknown>) =>
    apiRequest<PriceAdjustment>("/price-adjustments", { method: "POST", body: payload, auth: true });

  const deletePriceAdjustment = (id: number | string) =>
    apiRequest<void>(`/price-adjustments/${id}`, { method: "DELETE", auth: true });

  const getAvailability = (serviceIds: number[], week: number) =>
    apiRequest<{ dates: AvailabilityDay[] }>(
      `/v2/appointments?service_id=${encodeURIComponent(toCsv(serviceIds))}&week=${week}`,
    );

  const getCheckout = (
    serviceIds: number[],
    date: string,
    time: string,
    options?: { voucherCode?: string; email?: string },
  ) => {
    const params = new URLSearchParams({
      service_id: toCsv(serviceIds),
      date,
      time,
    });
    if (options?.voucherCode) {
      params.set("voucher_code", options.voucherCode);
    }
    if (options?.email) {
      params.set("email", options.email);
    }
    return apiRequest<CheckoutResponse>(`/v2/checkout?${params.toString()}`);
  };

  const getVouchers = () => apiRequest<Voucher[]>("/v2/vouchers", { auth: true });
  const getVoucher = (id: number | string) => apiRequest<Voucher>(`/v2/vouchers/${id}`, { auth: true });
  const createVoucher = (payload: Partial<Voucher>) =>
    apiRequest<Voucher>("/v2/vouchers", { method: "POST", body: payload, auth: true });
  const updateVoucher = (id: number | string, payload: Partial<Voucher>) =>
    apiRequest<Voucher>(`/v2/vouchers/${id}`, { method: "PATCH", body: payload, auth: true });
  const deleteVoucher = (id: number | string) =>
    apiRequest<{ message?: string }>(`/v2/vouchers/${id}`, { method: "DELETE", auth: true });
  const validateVoucher = (payload: {
    code: string;
    email?: string;
    service_ids: number[];
    date: string;
    time: string;
  }) =>
    apiRequest<VoucherValidationResult>("/v2/vouchers/validate", {
      method: "POST",
      body: payload,
    });

  const createAppointment = (payload: AppointmentCreatePayload) =>
    apiRequest<Appointment>("/v2/appointments", { method: "POST", body: payload });

  const cancelAppointmentByKey = (key: string) =>
    apiRequest<{ success?: boolean; message?: string }>(`/v2/appointments/cancel/${encodeURIComponent(key)}`);

  const login = (email: string, password: string) =>
    apiRequest<{ access_token: string }>("/login", {
      method: "POST",
      body: { email, password },
    });

  const getBookees = (start?: string, end?: string) => {
    const query = new URLSearchParams();
    if (start) query.set("start", start);
    if (end) query.set("end", end);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<Appointment[]>(`/v2/bookees${suffix}`, { auth: true });
  };

  const getAppointment = (id: number | string) => apiRequest<Appointment>(`/v2/appointments/${id}`, { auth: true });

  const updateAppointment = (id: number | string, payload: Record<string, unknown>) =>
    apiRequest<Appointment>(`/v2/appointments/${id}`, { method: "PATCH", body: payload, auth: true });

  const updateAppointmentCalendar = (id: number | string, payload: Record<string, unknown>) =>
    apiRequest<Appointment>(`/appointments/${id}`, { method: "PATCH", body: payload, auth: true });

  const cancelAppointmentAdmin = (id: number | string) =>
    apiRequest<{ success?: boolean; message?: string }>("/v2/bookee-cancellation", {
      method: "POST",
      body: { id },
      auth: true,
    });

  const markAsPaid = (id: number | string, amount: number) =>
    apiRequest<{ success?: boolean; message?: string }>(`/v2/appointments/hasPayed/${id}`, {
      method: "POST",
      body: { amount },
      auth: true,
    });

  const createAdminAppointment = (payload: Record<string, unknown>) =>
    apiRequest<Appointment>("/v2/appointment-booking-admin", { method: "POST", body: payload, auth: true });

  const getAdminTimes = (serviceIds: number[], date: string) =>
    apiRequest<string[] | { times: string[] }>(
      `/v2/appointment-admin-times?service_ids=${encodeURIComponent(toCsv(serviceIds))}&date=${encodeURIComponent(date)}`,
      { auth: true },
    );

  const getPauseTimes = () => apiRequest<PauseTime[]>("/pause-times", { auth: true });
  const getPauseTime = (id: number | string) => apiRequest<PauseTime>(`/pause-times/${id}`, { auth: true });
  const createPause = (payload: Record<string, unknown>) =>
    apiRequest<PauseTime>("/pause-times", { method: "POST", body: payload, auth: true });
  const updatePause = (id: number | string, payload: Record<string, unknown>) =>
    apiRequest<PauseTime>(`/pause-times/${id}`, { method: "PATCH", body: payload, auth: true });
  const deletePause = (id: number | string) =>
    apiRequest<{ success?: boolean; message?: string }>(`/pause-times/${id}`, { method: "DELETE", auth: true });

  const getBusinessHours = (auth = true) => apiRequest<BusinessHour[]>("/business-hours", { auth });
  const saveBusinessHours = (payload: BusinessHour[]) =>
    apiRequest<BusinessHour[]>("/business-hours", { method: "POST", body: payload, auth: true });

  const getHolidays = () => apiRequest<Holiday[]>("/holidays", { auth: true });
  const createHoliday = (from_date: string, to_date: string) =>
    apiRequest<HolidayCreateResponse>("/holidays", {
      method: "POST",
      body: { from_date, to_date },
      auth: true,
    });
  const deleteHoliday = (id: number | string) =>
    apiRequest<{ success?: boolean; message?: string }>(`/holidays/${id}`, { method: "DELETE", auth: true });

  const getCustomers = (options?: { lite?: boolean }) => {
    const query = options?.lite ? "?lite=1" : "";
    return apiRequest<Customer[]>(`/v2/customers${query}`, { auth: true });
  };

  const getServiceCategories = () => apiRequest<ServiceCategory[]>("/service-categories");
  const createServiceCategory = (payload: Partial<ServiceCategory>) =>
    apiRequest<ServiceCategory>("/service-categories", { method: "POST", body: payload, auth: true });
  const updateServiceCategory = (id: number | string, payload: Partial<ServiceCategory>) =>
    apiRequest<ServiceCategory>(`/service-categories/${id}`, { method: "PATCH", body: payload, auth: true });
  const deleteServiceCategory = (id: number | string) =>
    apiRequest<{ message?: string }>(`/service-categories/${id}`, { method: "DELETE", auth: true });
  const createCustomer = (payload: Partial<Customer>) =>
    apiRequest<Customer>("/v2/customers", { method: "POST", body: payload, auth: true });
  const getCustomer = (id: number | string) => apiRequest<Customer>(`/v2/customers/${id}`, { auth: true });
  const updateCustomer = (id: number | string, payload: Partial<Customer>) =>
    apiRequest<Customer>(`/v2/customers/${id}`, { method: "PATCH", body: payload, auth: true });
  const deleteCustomer = (id: number | string) =>
    apiRequest<{ success?: boolean; message?: string }>(`/v2/customers/${id}`, { method: "DELETE", auth: true });

  const blockCustomer = (id: number | string) =>
    apiRequest<Customer>(`/v2/customer/${id}/blockCustomer`, { method: "PATCH", auth: true });

  const unblockCustomer = (id: number | string) =>
    apiRequest<Customer>(`/v2/customer/${id}/unblockCustomer`, { method: "PATCH", auth: true });

  const getRevenue = (month: number) => apiRequest<RevenueEntry[]>(`/revenue?month=${month}`, { auth: true });

  const getRevenueReport = (month: number) =>
    apiRequest<RevenueReport>(`/revenue?month=${month}`, { auth: true });

  return {
    getServices,
    getService,
    createService,
    updateService,
    deleteService,
    getSettings,
    updateSetting,
    getPriceAdjustments,
    createPriceAdjustment,
    deletePriceAdjustment,
    getAvailability,
    getCheckout,
    createAppointment,
    cancelAppointmentByKey,
    login,
    getBookees,
    getAppointment,
    updateAppointment,
    updateAppointmentCalendar,
    cancelAppointmentAdmin,
    markAsPaid,
    createAdminAppointment,
    getAdminTimes,
    getPauseTimes,
    getPauseTime,
    createPause,
    updatePause,
    deletePause,
    getBusinessHours,
    saveBusinessHours,
    getHolidays,
    createHoliday,
    deleteHoliday,
    getCustomers,
    getServiceCategories,
    createServiceCategory,
    updateServiceCategory,
    deleteServiceCategory,
    createCustomer,
    getCustomer,
    updateCustomer,
    deleteCustomer,
    blockCustomer,
    unblockCustomer,
    getRevenue,
    getRevenueReport,
    getVouchers,
    getVoucher,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    validateVoucher,
  };
};
