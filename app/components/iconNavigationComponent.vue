<template>
  <nav class="grid gap-1 px-1 pt-1" :class="isAdmin ? 'grid-cols-5' : 'grid-cols-3'">
    <nuxt-link class="flex flex-col items-center px-1 py-2" to="/admin">
      <img src="/holiday.svg" class="h-6 w-6" alt="" />
      <span class="mt-1 text-[10px] text-neutral-400">Buchungen</span>
    </nuxt-link>
    <nuxt-link
      v-if="isAdmin"
      class="flex flex-col items-center px-1 py-2"
      to="/admin/employees"
    >
      <img src="/team.svg" class="h-6 w-6" alt="" />
      <span class="mt-1 text-[10px] text-neutral-400">Team</span>
    </nuxt-link>
    <nuxt-link
      v-else-if="myEmployeePath"
      class="flex flex-col items-center px-1 py-2"
      :to="myEmployeePath"
    >
      <img src="/profile.svg" class="h-6 w-6" alt="" />
      <span class="mt-1 text-[10px] text-neutral-400">Mein Profil</span>
    </nuxt-link>
    <nuxt-link
      v-if="isAdmin"
      class="flex flex-col items-center px-1 py-2"
      to="/admin/services"
    >
      <img src="/list.svg" class="h-6 w-6" alt="" />
      <span class="mt-1 text-[10px] text-neutral-400">Leistungen</span>
    </nuxt-link>
    <nuxt-link class="flex flex-col items-center px-1 py-2" to="/admin/opening-hours">
      <img src="/opening_hours.svg" class="h-6 w-6" alt="" />
      <span class="mt-1 text-[10px] text-neutral-400">{{ isAdmin ? "Zeiten" : "Urlaub" }}</span>
    </nuxt-link>
    <nuxt-link
      v-if="isAdmin"
      class="flex flex-col items-center px-1 py-2"
      to="/admin/reporting"
    >
      <img src="/reporting.svg" class="h-6 w-6" alt="" />
      <span class="mt-1 text-[10px] text-neutral-400">Reports</span>
    </nuxt-link>
  </nav>
</template>

<script setup lang="ts">
const { isAdmin, user } = useAuth();
const myEmployeePath = computed(() => (user.value?.id ? `/admin/employees/${user.value.id}` : null));
</script>
