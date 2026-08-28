import type {
  Appointment,
  AppointmentCreatePayload,
  AvailabilityDay,
  AvailabilityResponse,
  ReschedulePreviewResponse,
  RescheduleSubmitResponse,
  BusinessHour,
  CheckoutItem,
  CheckoutResponse,
  Customer,
  PaginatedResponse,
  Voucher,
  VoucherValidationResult,
  Holiday,
  PauseTime,
  RevenueEntry,
  Service,
  ServiceCategory,
  StaffEmployee,
  EmployeeBusinessHour,
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
  employee_id?: number | null;
  [key: string]: unknown;
}

export interface HolidayCreateResponse {
  holidays?: Holiday[];
  conflicting_appointments?: Appointment[];
}

export const useBookingApi = () => {
  const getServices = (auth = false) => apiRequest<Service[]>("/service", { auth });
  const getTopSellerServices = (limit = 4) =>
    apiRequest<Service[]>(`/service/topsellers?limit=${limit}`);
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

  const getAvailability = (serviceIds: number[], week: number, employeeId?: number | null) => {
    const params = new URLSearchParams({
      service_id: toCsv(serviceIds),
      week: String(week),
    });
    if (employeeId) params.set("employee_id", String(employeeId));
    return apiRequest<AvailabilityResponse>(`/v2/appointments?${params.toString()}`);
  };

  const getPublicEmployees = (serviceIds: number[]) =>
    apiRequest<{ employees: StaffEmployee[]; suggested_employee_id?: number | null }>(
      `/employees?service_id=${encodeURIComponent(toCsv(serviceIds))}`,
    );

  const getTeamEmployees = () =>
    apiRequest<{ employees: StaffEmployee[] }>("/employees/team");

  const getEmployees = () => apiRequest<StaffEmployee[]>("/employees/list", { auth: true });
  const getEmployee = (id: number | string) => apiRequest<StaffEmployee>(`/employees/${id}`, { auth: true });
  const createEmployee = (payload: Record<string, unknown>) =>
    apiRequest<StaffEmployee>("/employees", { method: "POST", body: payload, auth: true });
  const updateEmployee = (id: number | string, payload: Record<string, unknown>) =>
    apiRequest<StaffEmployee>(`/employees/${id}`, { method: "PATCH", body: payload, auth: true });
  const deactivateEmployee = (id: number | string) =>
    apiRequest<{ message?: string; employee?: StaffEmployee }>(`/employees/${id}`, { method: "DELETE", auth: true });
  const uploadEmployeePhoto = (id: number | string, file: File) => {
    const body = new FormData();
    body.append("photo", file);
    return apiRequest<StaffEmployee>(`/employees/${id}/photo`, {
      method: "POST",
      body,
      auth: true,
    });
  };
  const deleteEmployeePhoto = (id: number | string) =>
    apiRequest<StaffEmployee>(`/employees/${id}/photo`, { method: "DELETE", auth: true });
  const syncEmployeeServices = (id: number | string, serviceIds: number[]) =>
    apiRequest<StaffEmployee>(`/employees/${id}/services`, {
      method: "PUT",
      body: { service_ids: serviceIds },
      auth: true,
    });
  const syncServiceEmployees = (id: number | string, employeeIds: number[]) =>
    apiRequest<Service>(`/service/${id}/employees`, {
      method: "PUT",
      body: { employee_ids: employeeIds },
      auth: true,
    });

  const getEmployeeBusinessHours = (employeeId: number | string) =>
    apiRequest<EmployeeBusinessHour[]>(`/employees/${employeeId}/business-hours`, { auth: true });
  const syncEmployeeBusinessHours = (employeeId: number | string, hours: EmployeeBusinessHour[]) =>
    apiRequest<EmployeeBusinessHour[]>(`/employees/${employeeId}/business-hours`, {
      method: "PUT",
      body: { hours },
      auth: true,
    });

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

  const createAppointment = async (payload: AppointmentCreatePayload) => {
    const response = await apiRequest<{ message?: string; appointment: Appointment } | Appointment>(
      "/v2/appointments",
      { method: "POST", body: payload },
    );
    if (response && typeof response === "object" && "appointment" in response && response.appointment) {
      return response.appointment;
    }
    return response as Appointment;
  };

  const cancelAppointmentByKey = (key: string) =>
    apiRequest<{ success?: boolean; message?: string }>(`/v2/appointments/cancel/${encodeURIComponent(key)}`);

  const getReschedulePreview = (key: string, week = 0, employeeId?: number | null) => {
    const params = new URLSearchParams({ week: String(week) });
    if (employeeId) params.set("employee_id", String(employeeId));
    return apiRequest<ReschedulePreviewResponse>(
      `/v2/appointments/reschedule/${encodeURIComponent(key)}?${params.toString()}`,
    );
  };

  const submitReschedule = (
    key: string,
    payload: { date: string; time: string; employee_id?: number },
  ) =>
    apiRequest<RescheduleSubmitResponse>(`/v2/appointments/reschedule/${encodeURIComponent(key)}`, {
      method: "POST",
      body: payload,
    });

  const login = (email: string, password: string) =>
    apiRequest<{
      access_token: string;
      role?: string;
      user?: { id: number; name: string; email: string; role?: string; display_name?: string | null };
    }>("/login", {
      method: "POST",
      body: { email, password },
    });

  const getBookees = (
    start?: string,
    end?: string,
    options?: { scope?: "mine" | "all"; employee_id?: number },
  ) => {
    const query = new URLSearchParams();
    if (start) query.set("start", start);
    if (end) query.set("end", end);
    if (options?.scope) query.set("scope", options.scope);
    if (options?.employee_id) query.set("employee_id", String(options.employee_id));
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

  const getAdminTimes = (serviceIds: number[], date: string, employeeId?: number | null) => {
    const params = new URLSearchParams({
      service_ids: toCsv(serviceIds),
      date,
    });
    if (employeeId) params.set("employee_id", String(employeeId));
    return apiRequest<{ times: string[]; employees?: StaffEmployee[]; employee_id?: number; suggested_employee_id?: number }>(
      `/v2/appointment-admin-times?${params.toString()}`,
      { auth: true },
    );
  };

  const getPauseTimes = (userId?: number | null) => {
    const suffix = userId ? `?user_id=${userId}` : "";
    return apiRequest<PauseTime[]>(`/pause-times${suffix}`, { auth: true });
  };
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

  const getHolidays = (options?: { status?: string; user_id?: number }) => {
    const query = new URLSearchParams();
    if (options?.status) query.set("status", options.status);
    if (options?.user_id) query.set("user_id", String(options.user_id));
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<Holiday[]>(`/holidays${suffix}`, { auth: true });
  };
  const createHoliday = (from_date: string, to_date: string, options?: { user_id?: number; note?: string }) =>
    apiRequest<HolidayCreateResponse>("/holidays", {
      method: "POST",
      body: {
        from_date,
        to_date,
        ...(options?.user_id ? { user_id: options.user_id } : {}),
        ...(options?.note ? { note: options.note } : {}),
      },
      auth: true,
    });
  const deleteHoliday = (id: number | string) =>
    apiRequest<{ success?: boolean; message?: string }>(`/holidays/${id}`, { method: "DELETE", auth: true });
  const approveHoliday = (id: number | string) =>
    apiRequest<{ message?: string; holiday?: Holiday }>(`/holidays/${id}/approve`, { method: "POST", auth: true });
  const rejectHoliday = (id: number | string) =>
    apiRequest<{ message?: string; holiday?: Holiday }>(`/holidays/${id}/reject`, { method: "POST", auth: true });

  const buildCustomerQuery = (options?: {
    lite?: boolean;
    page?: number;
    per_page?: number;
    q?: string;
  }) => {
    const params = new URLSearchParams();
    if (options?.lite) params.set("lite", "1");
    if (options?.page) params.set("page", String(options.page));
    if (options?.per_page) params.set("per_page", String(options.per_page));
    if (options?.q) params.set("q", options.q);
    const query = params.toString();
    return query ? `?${query}` : "";
  };

  const getCustomers = (options?: { lite?: boolean; page?: number; per_page?: number }) => {
    const query = buildCustomerQuery(options);
    return apiRequest<PaginatedResponse<Customer>>(`/v2/customers${query}`, { auth: true });
  };

  const searchCustomers = (options: {
    q: string;
    lite?: boolean;
    page?: number;
    per_page?: number;
  }) => {
    const query = buildCustomerQuery(options);
    return apiRequest<PaginatedResponse<Customer>>(`/v2/customers/search${query}`, { auth: true });
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

  const getRevenueReport = (month: number, options?: { employee_id?: number | null }) => {
    const params = new URLSearchParams({ month: String(month) });
    if (options?.employee_id != null) {
      params.set("employee_id", String(options.employee_id));
    }
    return apiRequest<RevenueReport>(`/revenue?${params.toString()}`, { auth: true });
  };

  const getPushVapidPublicKey = () =>
    apiRequest<{ public_key: string }>("/v2/push/vapid-public-key", { auth: true });

  const subscribePush = (payload: {
    endpoint: string;
    public_key: string;
    auth_token: string;
    content_encoding?: string;
  }) =>
    apiRequest<{ message?: string }>("/v2/push/subscribe", {
      method: "POST",
      body: payload,
      auth: true,
    });

  const unsubscribePush = (payload: { endpoint: string }) =>
    apiRequest<{ message?: string }>("/v2/push/unsubscribe", {
      method: "POST",
      body: payload,
      auth: true,
    });

  return {
    getServices,
    getTopSellerServices,
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
    getPublicEmployees,
    getTeamEmployees,
    getEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deactivateEmployee,
    uploadEmployeePhoto,
    deleteEmployeePhoto,
    syncEmployeeServices,
    syncServiceEmployees,
    getEmployeeBusinessHours,
    syncEmployeeBusinessHours,
    getCheckout,
    createAppointment,
    cancelAppointmentByKey,
    getReschedulePreview,
    submitReschedule,
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
    approveHoliday,
    rejectHoliday,
    getCustomers,
    searchCustomers,
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
    getPushVapidPublicKey,
    subscribePush,
    unsubscribePush,
    getVouchers,
    getVoucher,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    validateVoucher,
  };
};
