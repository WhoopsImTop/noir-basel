<template>
  <nav class="grid grid-cols-4 gap-1 px-2 pt-1">
    <nuxt-link class="flex flex-col items-center px-1 py-2" to="/admin">
      <img src="/holiday.svg" class="h-6 w-6" alt="" />
      <span class="mt-1 text-[10px] text-neutral-400">Buchungen</span>
    </nuxt-link>
    <nuxt-link class="flex flex-col items-center px-1 py-2" to="/admin/services">
      <img src="/list.svg" class="h-6 w-6" alt="" />
      <span class="mt-1 text-[10px] text-neutral-400">Leistungen</span>
    </nuxt-link>
    <nuxt-link class="flex flex-col items-center px-1 py-2" to="/admin/opening-hours">
      <img src="/opening_hours.svg" class="h-6 w-6" alt="" />
      <span class="mt-1 text-[10px] text-neutral-400">Öffnungszeiten</span>
    </nuxt-link>
    <nuxt-link class="flex flex-col items-center px-1 py-2" to="/admin/reporting">
      <img src="/reporting.svg" class="h-6 w-6" alt="" />
      <span class="mt-1 text-[10px] text-neutral-400">Reports</span>
    </nuxt-link>
  </nav>
</template>
