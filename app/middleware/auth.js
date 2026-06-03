export default defineNuxtRouteMiddleware(async (to) => {
  if (!process.client) return;

  if (to.path.startsWith("/admin/auth")) {
    return;
  }

  if (!to.path.startsWith("/admin")) {
    return;
  }

  const token = localStorage.getItem("access_token");
  if (!token) {
    return navigateTo("/admin/auth/login");
  }
});
