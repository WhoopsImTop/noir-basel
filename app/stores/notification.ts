export const useNotificationStore = defineStore("notification", {
  state: () => ({
    message: "" as string,
    status: "" as string,
    show: false as boolean,
  }),
  actions: {
    showNotification(status: string, message: string) {
      this.status = status;
      this.message = message;
      this.show = true;
      setTimeout(() => {
        this.show = false;
      }, 3000);
    },
    addNotification(payload: { type: string; message: string }) {
      this.showNotification(payload.type, payload.message);
    },
    hideNotification() {
      this.show = false;
    },
  },
});
