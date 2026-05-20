<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <div
      class="w-full max-w-[450px] rounded border border-[#C0C0C0]/15 bg-[#1a1a1a] p-6"
    >
      <h1 class="text-center font-heading text-2xl tracking-[0.08em] text-white">
        Admin
      </h1>
      <p class="mt-1 text-center text-xs uppercase tracking-[0.2em] text-[#C0C0C0]/55">
        Anmelden
      </p>
      <hr class="my-6 border-[#C0C0C0]/15" />
      <form class="flex flex-col gap-4" @submit.prevent="login">
        <input
          v-model="email"
          type="email"
          name="email"
          autocomplete="email"
          placeholder="E-Mail"
          class="rounded border border-[#C0C0C0]/22 bg-[#0a0a0a]/50 px-3 py-2 text-sm text-white placeholder:text-white/35"
        />
        <input
          v-model="password"
          type="password"
          name="password"
          autocomplete="current-password"
          placeholder="Passwort"
          class="rounded border border-[#C0C0C0]/22 bg-[#0a0a0a]/50 px-3 py-2 text-sm text-white placeholder:text-white/35"
        />
        <p v-if="errorMessage" class="text-center text-sm text-red-400">
          {{ errorMessage }}
        </p>
        <button
          type="submit"
          class="rounded bg-white px-4 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-[#0A0A0A] disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="loading || !email || !password"
        >
          {{ loading ? "Lade…" : "Anmelden" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ApiError } from "~/utils/api";

defineI18nRoute(false);

definePageMeta({
  title: "Login",
  description: "Login to the admin area",
  layout: false,
});

const { login: apiLogin } = useBookingApi();

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");

const router = useRouter();

const login = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const data = await apiLogin(email.value, password.value);
    localStorage.setItem("access_token", data.access_token);
    await router.push("/admin");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      errorMessage.value = "Falsche E-Mail oder Passwort";
    } else {
      errorMessage.value = "Ein Fehler ist aufgetreten";
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style>
#usercentrics-root {
  display: none;
}
</style>
