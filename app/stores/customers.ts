export const useCustomerStore = defineStore("customers", {
  state: () => ({
    customers: [] as any[],
  }),
  actions: {
    async fetch() {
      const api = useBookingApi();
      try {
        this.customers = await api.getCustomers({ lite: true });
      } catch {
        if (process.client) {
          localStorage.removeItem("access_token");
        }
      }
    },
  },
});
