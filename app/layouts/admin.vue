<template>
  <div class="min-h-screen bg-black text-white">
    <header class="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur">
      <div class="page-container relative flex items-center justify-between py-3">
        <NuxtLink to="/admin" class="text-xs font-semibold uppercase tracking-[0.14em] opacity-0 sm:text-sm">Noir Admin</NuxtLink>
        <NuxtLink to="/admin" class="pointer-events-auto absolute left-1/2 -translate-x-1/2 text-4xl leading-none tracking-tight text-white">
          BARBER MO
        </NuxtLink>
        <button class="rounded-sm border border-white/20 px-2.5 py-1 text-[11px] uppercase tracking-[0.1em] sm:px-3 sm:text-xs" @click="logout">
          Logout
        </button>
      </div>
      <nav class="page-container hidden gap-4 pb-3 md:flex">
        <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" class="text-xs uppercase tracking-[0.12em] text-white/70 hover:text-white">
          {{ item.label }}
        </NuxtLink>
      </nav>
    </header>

    <main class="pb-28 md:pb-10">
      <NuxtPage />
    </main>

    <nav class="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/95 px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] md:hidden">
      <div class="grid grid-cols-5 gap-1.5">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="rounded-sm px-1 py-2 text-center text-[10px] uppercase tracking-[0.06em]"
          :class="isActive(item.to) ? 'bg-white text-black' : 'text-white/75'"
        >
          {{ item.label }}
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();
const route = useRoute();

const navItems = [
  { label: "Kalender", to: "/admin" },
  { label: "Kunden", to: "/admin/customers" },
  { label: "Services", to: "/admin/services" },
  { label: "Zeiten", to: "/admin/opening-hours" },
  { label: "Umsatz", to: "/admin/revenue" },
];

const isActive = (target: string) =>
  route.path === target || (target !== "/admin" && route.path.startsWith(`${target}/`));

const logout = async () => {
  localStorage.removeItem("access_token");
  await router.push("/admin/auth/login");
};
</script>
