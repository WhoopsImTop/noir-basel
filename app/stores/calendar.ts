export const useCalendarStore = defineStore("calendar", {
  state: () => ({
    currentDate: new Date() as Date | string,
  }),
  actions: {
    setCurrentDate(date: Date | string) {
      this.currentDate = date;
    },
  },
});
