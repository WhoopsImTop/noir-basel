<template>
  <div
    class="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 gap-4 border-t border-neutral-700 bg-neutral-800 px-4"
  >
    <nuxt-link class="flex flex-col items-center p-2" to="/admin">
      <img src="/holiday.svg" class="w-6 h-6" />
      <h2 class="text-xs text-neutral-400 mt-1.5">Buchungen</h2>
    </nuxt-link>
    <nuxt-link class="flex flex-col items-center p-2" to="/admin/services">
      <img src="/list.svg" class="w-6 h-6" />
      <h2 class="text-xs text-neutral-400 mt-1.5">Leistungen</h2>
    </nuxt-link>
    <nuxt-link class="flex flex-col items-center p-2" to="/admin/opening-hours">
      <img src="/opening_hours.svg" class="w-6 h-6" />
      <h2 class="text-xs text-neutral-400 mt-1.5">Öffnungszeiten</h2>
    </nuxt-link>
    <nuxt-link class="flex flex-col items-center p-2" to="/admin/reporting">
      <img src="/reporting.svg" class="w-6 h-6" />
      <h2 class="text-xs text-neutral-400 mt-1.5">Reports</h2>
    </nuxt-link>
  </div>
</template>

<script>
export default {};
</script>

<style></style>
