export default defineNuxtRouteMiddleware(async (to) => {
  if (!process.client) return;

  const { hydrateFromStorage, clearSession } = useAuth();
  hydrateFromStorage();

  if (to.path.startsWith("/admin/auth")) {
    return;
  }

  if (!to.path.startsWith("/admin")) {
    return;
  }

  const token = localStorage.getItem("access_token");
  if (!token) {
    clearSession();
    return navigateTo("/admin/auth/login");
  }
});
