export const useCalendarStore = defineStore("calendar", {
  state: () => ({
    currentDate: new Date() as Date | string,
    refreshTick: 0,
  }),
  actions: {
    setCurrentDate(date: Date | string) {
      this.currentDate = date;
    },
    triggerRefresh() {
      this.refreshTick += 1;
    },
  },
});
