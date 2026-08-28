<template>
  <div class="flex flex-col items-center container mx-auto py-32 p-4 text-neutral-200">
    <div class="flex items-start justify-center w-48 h-48 rounded-full overflow-hidden mb-8 border-4 border-neutral-600" id="aboutImage">
      <img src="/pwa-512.png" alt="Noir Basel" class="object-cover" />
    </div>
    <h1 class="text-neutral-200 font-serif text-2xl uppercase font-bold" id="aboutTitle">
      @Noir.Basel
    </h1>
    <div class="flex flex-col text-center mt-4 w-2/3">
      <a v-for="(link, index) in links" :key="index" class="bg-neutral-600 text-neutral-200 px-4 py-2 rounded-full mt-4 flex items-center" :href="link.link"><img v-if="link.icon" width="25px" height="25px" style="margin-right: 10px" :src="link.icon" alt="icon" />{{ link.button }}</a>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: "Linktree - Noir Basel",
  meta: [
    {
      name: "description",
      content:
        "Noir Basel - Luxury Hair Salon in Basel. Folge mir auf TikTok und Instagram oder buche deinen Termin online.",
    },
  ],
});

const links = [
  {
    link: "https://www.tiktok.com/@noir.basel",
    button: "TikTok",
    icon: "/tiktok.png",
  },
  {
    link: "https://www.instagram.com/noir.basel/?hl=de",
    button: "Instagram",
    icon: "/instagram.png",
  },
  {
    link: "https://g.page/r/CZTscDMQNw19EBM/review",
    button: "Auf Google bewerten",
    icon: "/google-logo.png",
  },
  {
    link: "https://noir-basel.com/online-booking",
    button: "Termin Buchen",
  },
  {
    link: "https://noir-basel.com",
    button: "Webseite",
  },
  {
    link: "https://www.google.com/maps/place/Noir+Basel/@47.5544004,7.5684506,15z/data=!4m10!1m2!2m1!1snoir+basel!3m6!1s0x4791b93a4ec9c38f:0x7d0d37103370ec94!8m2!3d47.5428319!4d7.5923241!15sCgpub2lyIGJhc2VsWgwiCm5vaXIgYmFzZWySAQpoYWlyX3NhbG9u4AEA!16s%2Fg%2F11zbj9_9bk?entry=ttu&g_ep=EgoyMDI2MDUzMS4wIKXMDSoASAFQAw%3D%3D",
    button: "Standort",
  },
];
</script>

<style></style>
