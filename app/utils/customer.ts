export const LOYAL_CUSTOMER_MIN_APPOINTMENTS = 5;

export function getCompletedAppointmentsCount(customer: {
  completed_appointments_count?: number;
  appointments_count?: number;
} | null | undefined): number {
  if (!customer) {
    return 0;
  }
  return customer.completed_appointments_count ?? customer.appointments_count ?? 0;
}

export function isLoyalCustomer(customer: {
  completed_appointments_count?: number;
  appointments_count?: number;
} | null | undefined): boolean {
  return getCompletedAppointmentsCount(customer) >= LOYAL_CUSTOMER_MIN_APPOINTMENTS;
}

export function isNewCustomer(createdAt?: string | null): boolean {
  if (!createdAt) {
    return false;
  }
  const created = new Date(createdAt);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
}
