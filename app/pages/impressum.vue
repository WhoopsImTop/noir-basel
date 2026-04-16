<template>
  <div class="container mx-auto pt-36 p-4 text-neutral-200">
    <h1 class="text-4xl font-bold">Impressum</h1>
    <h2 class="font-serif text-2xl md:text-4xl font-bold mt-12 mb-4">
      Angaben gemäß § 5 TMG
    </h2>
    <p>Mohammed Hakla<br /></p>
    <h2 class="font-serif text-2xl md:text-4xl font-bold mt-12 mb-4">
      Kontakt
    </h2>
    <p>E-Mail: info@barber-mo.com</p>
    <h2 class="font-serif text-2xl md:text-4xl font-bold mt-12 mb-4">
      Redaktionell verantwortlich
    </h2>
    <p>Mohammed Hakla</p>
    <h2 class="font-serif text-2xl md:text-4xl font-bold mt-12 mb-4">
      Umsatzsteuer-ID
    </h2>
    <p>in vergabe durch das Finanzamt</p>
    <h2 class="font-serif text-2xl md:text-4xl font-bold mt-12 mb-4">
      EU-Streitschlichtung
    </h2>
    <p>
      Die Europäische Kommission stellt eine Plattform zur
      Online-Streitbeilegung (OS) bereit:
      <a
        href="https://ec.europa.eu/consumers/odr/"
        target="_blank"
        rel="noopener noreferrer"
        >https://ec.europa.eu/consumers/odr/</a
      >.<br />
      Unsere E-Mail-Adresse finden Sie oben im Impressum.
    </p>
    <h2 class="font-serif text-2xl md:text-4xl font-bold mt-12 mb-4">
      Verbraucher&shy;streit&shy;beilegung/Universal&shy;schlichtungs&shy;stelle
    </h2>
    <p>
      Wir nehmen an einem Streitbeilegungsverfahren vor einer
      Verbraucherschlichtungsstelle teil. Zuständig ist die
      Universalschlichtungsstelle des Zentrums für Schlichtung e.V., Straßburger
      Straße 8, 77694 Kehl am Rhein (<a
        href="https://www.verbraucher-schlichter.de"
        rel="noopener noreferrer"
        target="_blank"
        >https://www.verbraucher-schlichter.de</a
      >).
    </p>
  </div>
  <div class="container mx-auto px-4 pt-36 pb-8" id="kontakt">
    <h2 class="text-neutral-200 text-4xl uppercase font-bold">
      <span class="highlight">Kontakt</span>
    </h2>
    <p class="text-neutral-400 mt-3">
      Du hast Fragen oder möchtest einen Termin vereinbaren? Dann schreib mir
      einfach eine Nachricht.
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2">
      <div class="mt-8">
        <h3 class="text-neutral-200 text-2xl uppercase font-bold">Adresse</h3>
        <p class="text-neutral-400 mt-3">Barbershop M43</p>
        <p class="text-neutral-400">Rosentalstrasse 40</p>
        <p class="text-neutral-400">4057 Basel</p>
      </div>
      <div class="mt-8">
        <h3 class="text-neutral-200 text-2xl uppercase font-bold">Kontakt</h3>
        <a href="mailto:info@barber-mo.com" class="text-neutral-400 mt-3"
          >info@barber-mo.com</a
        >
        <p class="text-neutral-400">Schreib mir auf TikTok oder Instagram</p>
      </div>
    </div>
    <hr class="border-neutral-700 my-8" />
    <div class="flex items-center gap-2">
      <nuxt-link
        :to="localePath('/impressum')"
        class="text-neutral-400 underline"
        >{{ $t("legal.impressumTitle") }}</nuxt-link
      >
      <nuxt-link
        :to="localePath('/datenschutzerklaerung')"
        class="text-neutral-400 underline ml-8"
        >{{ $t("legal.datenschutzTitle") }}</nuxt-link
      >
      <nuxt-link
        :to="localePath('/agb')"
        class="text-neutral-400 underline ml-8"
        >{{ $t("legal.agbTitle") }}</nuxt-link
      >
    </div>
  </div>
</template>

<script setup>
const localePath = useLocalePath();

useHead({
  title: "Impressum - Barber Mo",
});
</script>

<style></style>
