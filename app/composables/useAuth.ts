export type StaffRole = "admin" | "employee" | "customer" | string;

const TOKEN_KEY = "access_token";
const ROLE_KEY = "user_role";
const USER_KEY = "auth_user";

type AuthUser = {
  id: number;
  name: string;
  email: string;
  role?: string;
  display_name?: string | null;
  can_edit_appointments?: boolean;
  can_cancel_appointments?: boolean;
};

const readRole = (): StaffRole | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ROLE_KEY);
};

const readUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const useAuth = () => {
  const role = useState<StaffRole | null>("auth-role", () => readRole());
  const user = useState<AuthUser | null>("auth-user", () => readUser());

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

  /** Re-read role/user from localStorage after SSR/prerender hydrated null. */
  const hydrateFromStorage = () => {
    if (typeof window === "undefined") return;
    const storedRole = readRole();
    const storedUser = readUser();
    if (storedRole && role.value !== storedRole) {
      role.value = storedRole;
    }
    if (storedUser && (!user.value || user.value.id !== storedUser.id)) {
      user.value = storedUser;
    }
    if (!role.value && storedUser?.role) {
      role.value = storedUser.role;
    }
  };

  // Sync immediately on client so isAdmin is correct before page onMounted guards.
  if (import.meta.client) {
    hydrateFromStorage();
  }

  const setSession = (payload: {
    access_token: string;
    role?: string;
    user?: AuthUser;
  }) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, payload.access_token);
    const nextRole = payload.role || payload.user?.role || null;
    if (nextRole) {
      localStorage.setItem(ROLE_KEY, nextRole);
      role.value = nextRole;
    }
    if (payload.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
      user.value = payload.user;
      if (!nextRole && payload.user.role) {
        role.value = payload.user.role;
        localStorage.setItem(ROLE_KEY, payload.user.role);
      }
    }
  };

  const clearSession = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ROLE_KEY);
      localStorage.removeItem(USER_KEY);
    }
    role.value = null;
    user.value = null;
  };

  const isAdmin = computed(() => role.value === "admin");
  const isEmployee = computed(() => role.value === "employee");
  const isStaff = computed(() => role.value === "admin" || role.value === "employee");
  const canEditAppointments = computed(
    () => isAdmin.value || !!user.value?.can_edit_appointments,
  );
  const canCancelAppointments = computed(
    () => isAdmin.value || !!user.value?.can_cancel_appointments,
  );

  return {
    getToken,
    getRole: () => role.value,
    getUser: () => user.value,
    role,
    user,
    setSession,
    clearSession,
    hydrateFromStorage,
    isAdmin,
    isEmployee,
    isStaff,
    canEditAppointments,
    canCancelAppointments,
  };
};
