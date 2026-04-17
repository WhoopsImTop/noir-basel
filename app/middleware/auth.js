export default defineNuxtRouteMiddleware(() => {
  if (!process.client) return;
  const token = localStorage.getItem("access_token");
  if (!token) {
    return navigateTo("/admin/auth/login");
  }
});
