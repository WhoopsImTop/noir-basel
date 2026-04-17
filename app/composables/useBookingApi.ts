import type {
  Appointment,
  AppointmentCreatePayload,
  AvailabilityDay,
  BusinessHour,
  CheckoutItem,
  Customer,
  Holiday,
  PauseTime,
  RevenueEntry,
  Service,
} from "~/types/booking";
import { apiRequest, toCsv } from "~/utils/api";

interface SettingsResponse {
  [key: string]: string | number | null;
}

export const useBookingApi = () => {
  const getServices = () => apiRequest<Service[]>("/service");
  const createService = (payload: Partial<Service>) =>
    apiRequest<Service>("/service", { method: "POST", body: payload, auth: true });
  const updateService = (id: number | string, payload: Partial<Service>) =>
    apiRequest<Service>(`/service/${id}`, { method: "PATCH", body: payload, auth: true });
  const deleteService = (id: number | string) =>
    apiRequest<{ success?: boolean; message?: string }>(`/service/${id}`, { method: "DELETE", auth: true });

  const getSettings = (keys: string[], auth = false) =>
    apiRequest<SettingsResponse>(`/v2/settings?keys=${encodeURIComponent(keys.join(","))}`, { auth });

  const getAvailability = (serviceIds: number[], week: number) =>
    apiRequest<{ dates: AvailabilityDay[] }>(
      `/v2/appointments?service_id=${encodeURIComponent(toCsv(serviceIds))}&week=${week}`,
    );

  const getCheckout = (serviceIds: number[], date: string, time: string) =>
    apiRequest<CheckoutItem[]>(
      `/v2/checkout?service_id=${encodeURIComponent(toCsv(serviceIds))}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`,
    );

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
    apiRequest<string[]>(
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
    apiRequest<Holiday>("/holidays", {
      method: "POST",
      body: { from_date, to_date },
      auth: true,
    });
  const deleteHoliday = (id: number | string) =>
    apiRequest<{ success?: boolean; message?: string }>(`/holidays/${id}`, { method: "DELETE", auth: true });

  const getCustomers = () => apiRequest<Customer[]>("/v2/customers", { auth: true });
  const getCustomer = (id: number | string) => apiRequest<Customer>(`/v2/customers/${id}`, { auth: true });
  const updateCustomer = (id: number | string, payload: Partial<Customer>) =>
    apiRequest<Customer>(`/v2/customers/${id}`, { method: "PATCH", body: payload, auth: true });
  const deleteCustomer = (id: number | string) =>
    apiRequest<{ success?: boolean; message?: string }>(`/v2/customers/${id}`, { method: "DELETE", auth: true });

  const blockCustomer = (id: number | string) =>
    apiRequest<{ success?: boolean; message?: string }>(`/v2/customer/${id}/blockCustomer`, { method: "POST", auth: true });

  const getRevenue = (month: number) => apiRequest<RevenueEntry[]>(`/revenue?month=${month}`, { auth: true });

  return {
    getServices,
    createService,
    updateService,
    deleteService,
    getSettings,
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
    getCustomer,
    updateCustomer,
    deleteCustomer,
    blockCustomer,
    getRevenue,
  };
};
