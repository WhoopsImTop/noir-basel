<template>
  <section class="page-container pb-16 pt-32 text-white">
    <h1 class="text-3xl font-semibold uppercase tracking-[0.1em]">Admin Login</h1>
    <p v-if="errorMessage" class="mt-4 rounded-sm border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">
      {{ errorMessage }}
    </p>
    <form class="mt-8 grid max-w-md gap-4" @submit.prevent="submit">
      <input v-model.trim="email" type="email" placeholder="E-Mail" class="rounded-sm border border-white/20 bg-transparent px-3 py-2" required />
      <input
        v-model.trim="password"
        type="password"
        placeholder="Passwort"
        class="rounded-sm border border-white/20 bg-transparent px-3 py-2"
        required
      />
      <button class="rounded-sm bg-white px-4 py-2 text-sm font-medium uppercase tracking-[0.12em] text-black" :disabled="loading">
        {{ loading ? "Login..." : "Einloggen" }}
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { isApiError } from "~/utils/api";

const api = useBookingApi();
const router = useRouter();

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");

const submit = async () => {
  loading.value = true;
  errorMessage.value = "";
  try {
    const response = await api.login(email.value, password.value);
    localStorage.setItem("access_token", response.access_token);
    await router.push("/admin");
  } catch (error) {
    errorMessage.value = isApiError(error) ? error.message : "Login fehlgeschlagen.";
  } finally {
    loading.value = false;
  }
};
</script>
