<template>
  <div class="min-h-screen bg-neutral-900 text-white">
    <div
      v-if="notification.show"
      class="fixed top-4 right-4 z-[110] cursor-pointer rounded bg-gold-600 p-4 shadow-lg"
      @click="hideNotification"
    >
      <p class="font-bold text-neutral-100">{{ notification.status }}</p>
      <p class="text-neutral-100">{{ notification.message }}</p>
    </div>

    <header class="sticky top-0 z-40 border-b border-neutral-700 bg-neutral-900/95 backdrop-blur-md">
      <div class="page-container grid grid-cols-[1fr_auto_1fr] items-center py-3">
        <div aria-hidden="true" />
        <NuxtLink
          to="/admin"
          class="font-heading text-2xl leading-none tracking-[0.12em] text-white sm:text-3xl"
        >
          NOIR BASEL
        </NuxtLink>
        <div class="flex justify-end">
          <button
            type="button"
            class="border border-neutral-600 px-2.5 py-1 text-[11px] uppercase tracking-[0.1em] text-neutral-200 sm:px-3 sm:text-xs"
            @click="logout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>

    <main class="pb-24">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();
const notification = useNotificationStore();

const hideNotification = () => {
  notification.hideNotification();
};

const logout = async () => {
  localStorage.removeItem("access_token");
  await router.push("/admin/auth/login");
};
</script>
