<template>
  <div class="container mx-auto p-4 min-h-screen mb-16">
    <div class="flex justify-between items-center">
      <h2 class="text-sm font-medium text-neutral-200">Reporting</h2>
      <nuxt-link
        to="/admin/reporting"
        class="bg-gold-600 text-white px-4 py-2 rounded text-xs"
      >
        Zurück
      </nuxt-link>
    </div>
    <hr class="my-2 border-neutral-600" />

    <select
      v-model="selectedReport"
      @change="fetchData"
      class="w-full p-2 rounded-lg bg-neutral-700 text-neutral-100 mt-4"
    >
      <option v-for="month in 12" :key="month" :value="month">
        {{ monthNames[month - 1] }}
      </option>
    </select>

    <div class="mt-8 flex flex-col bg-neutral-800 rounded-lg p-4">
      <p class="text-neutral-400 text-sm mb-4">Umsatz nach Kalenderwoche</p>
      <div class="relative h-56 sm:h-64">
        <canvas ref="revenueChart" />
      </div>
    </div>

    <div class="mt-6">
      <h3 class="text-sm font-medium text-neutral-200 mb-3">
        Beliebte Leistungen ({{ monthNames[selectedReport - 1] }})
      </h3>
      <div v-if="rankedPopularServices.length" class="flex flex-col gap-2">
        <div
          v-for="(service, index) in rankedPopularServices"
          :key="service.id"
          class="flex items-center justify-between bg-neutral-800 rounded-lg px-4 py-3"
        >
          <span class="text-sm text-neutral-200">
            <span class="text-neutral-500 mr-2">#{{ index + 1 }}</span>
            {{ service.name }}
          </span>
          <span class="text-sm text-neutral-400 tabular-nums"
            >{{ service.bookings_count }} Buchungen</span
          >
        </div>
      </div>
      <p v-else class="text-sm text-neutral-500 bg-neutral-800 rounded-lg px-4 py-3">
        Für diesen Monat liegen noch keine Buchungen vor.
      </p>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-2">
      <div class="flex flex-col bg-neutral-800 rounded-lg p-2">
        <p class="text-neutral-400 text-sm">Monatsbrutto</p>
        <p class="text-white text-sm">{{ formatChf(revenueData.gross) }}</p>
      </div>
      <div class="flex flex-col bg-neutral-800 rounded-lg p-2">
        <p class="text-neutral-400 text-sm">Brutto bis Heute</p>
        <p class="text-white text-sm">
          {{ formatChf(revenueData.revenue_until_today) }}
        </p>
      </div>
      <div class="flex flex-col bg-neutral-800 rounded-lg p-2">
        <p class="text-neutral-400 text-sm">MwSt</p>
        <p class="text-white text-sm">{{ formatChf(revenueData.tax) }}</p>
      </div>
      <div class="flex flex-col bg-neutral-800 rounded-lg p-2">
        <p class="text-neutral-400 text-sm">Bookings</p>
        <p class="text-white text-sm">
          {{ revenueData.total_bookings }} von
          {{ parseInt(String(revenueData.total_possible_bookings)) || 0 }}
          {{ bookingPercentage }}
        </p>
      </div>
      <div class="flex flex-col bg-neutral-800 rounded-lg p-2">
        <p class="text-neutral-400 text-sm">Neukunden (letzter Monat)</p>
        <p class="text-white text-sm">
          {{ Math.round(revenueData.new_customers_last_month ?? 0) }} Kunden
        </p>
      </div>
      <div class="flex flex-col bg-neutral-800 rounded-lg p-2">
        <p class="text-neutral-400 text-sm">Neukunden (aktueller Monat)</p>
        <p class="text-white text-sm">
          {{ Math.round(revenueData.new_customers_this_month ?? 0) }} Kunden
          <span
            class="inline-block text-right text-xs ml-2"
            :class="{
              'text-green-500': (revenueData.customer_growth_rate ?? 0) > 0,
              'text-red-500': (revenueData.customer_growth_rate ?? 0) < 0,
            }"
            >{{
              parseFloat(String(revenueData.customer_growth_rate ?? 0)).toFixed(2)
            }}%</span
          >
        </p>
      </div>
    </div>

  </div>
  <icon-navigation-component />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from "vue";
import Chart from "chart.js/auto";

const api = useBookingApi();
const selectedReport = ref(new Date().getMonth() + 1);
const revenueData = ref({});
const revenueChart = ref(null);
let chartInstance = null;

const monthNames = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

const weekCharts = computed(() => {
  const weekly = revenueData.value.weekly_revenue ?? {};
  const entries = Object.entries(weekly).slice(0, 4);
  const charts = entries.map(([label, value]) => ({
    label,
    value: Number(value) || 0,
  }));

  while (charts.length < 4) {
    charts.push({ label: "—", value: 0 });
  }

  return charts;
});

const rankedPopularServices = computed(() =>
  (revenueData.value.popular_services ?? [])
    .filter((service) => service.bookings_count > 0)
    .sort((a, b) => b.bookings_count - a.bookings_count),
);

const bookingPercentage = computed(() => {
  const total = revenueData.value.total_bookings;
  const possible = revenueData.value.total_possible_bookings;
  return total && possible
    ? `(${Math.round((total / possible) * 100)}%)`
    : "";
});

const formatChf = (value) => {
  const amount = typeof value === "number" ? value : Number(value) || 0;
  return `${Math.round(amount)} CHF`;
};

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
};

const renderChart = () => {
  if (!revenueChart.value) {
    return;
  }

  destroyChart();

  const labels = weekCharts.value.map((week, index) =>
    week.label === "—" ? `Woche ${index + 1}` : `ab ${week.label}`,
  );
  const data = weekCharts.value.map((week) => week.value);

  chartInstance = new Chart(revenueChart.value.getContext("2d"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Umsatz (CHF)",
          data,
          backgroundColor: "#8f6c3f",
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${Math.round(ctx.parsed.y)} CHF`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: "#a3a3a3",
            maxRotation: 0,
            autoSkip: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "#a3a3a3",
            callback: (value) => `${value} CHF`,
          },
        },
      },
    },
  });
};

const fetchData = async () => {
  revenueData.value = await api.getRevenueReport(selectedReport.value);
  await nextTick();
  renderChart();
};

onMounted(fetchData);

onBeforeUnmount(destroyChart);
</script>

<style>
#usercentrics-root {
  display: none;
}
</style>
