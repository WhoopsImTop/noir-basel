import type { Customer } from "~/types/booking";

export const useCustomerStore = defineStore("customers", {
  state: () => ({
    searchResults: [] as Customer[],
    selectedCustomer: null as Customer | null,
  }),
  actions: {
    setSearchResults(customers: Customer[]) {
      this.searchResults = customers;
    },
    setSelectedCustomer(customer: Customer | null) {
      this.selectedCustomer = customer;
    },
    clearSearch() {
      this.searchResults = [];
      this.selectedCustomer = null;
    },
  },
});
