<template>
  <div v-if="!loadingData">
    <FullCalendar :options="calendarOptions" />
  </div>
  <div
    v-else
    class="text-center py-4 mt-4 flex items-center flex-col justify-center"
  >
    <img src="/loading.svg" alt="loading" class="animate-spin h-8 w-8" />
    <p class="text-neutral-400 mt-4">Lade alle Buchungen...</p>
  </div>
</template>

<script>
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import "bootstrap-icons/font/bootstrap-icons.css";

export default {
  components: {
    FullCalendar,
  },
  data() {
    return {
      loadingData: true,
      calendarOptions: {
        plugins: [
          interactionPlugin,
          dayGridPlugin,
          timeGridPlugin,
          bootstrap5Plugin,
          listPlugin,
        ],
        initialView: "listWeek",
        nowIndicator: true,
        locale: "de",
        editable: true,
        slotMinTime: "06:00:00",
        slotMaxTime: "22:00:00",
        allDaySlot: false,
        height: "auto",
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        },
        eventClick: this.calendarEventClick,
        eventResize: this.handleResize,
        eventDrop: this.handleEventDrop,
        eventColor: "#8f6c3f",
        datesSet: this.fetchNewAppointments,
        //on view change add calendarLayout parameter to url
        viewDidMount: (view) => {
          const url = new URL(window.location.href);
          url.searchParams.set("calendarLayout", view.view.type);
          window.history.pushState({}, "", url);
        },
      },
      calendarEvents: [],
      pauseEvents: [],
    };
  },
  methods: {
    api() {
      return useBookingApi();
    },
    calendarEventClick(info) {
      const { event } = info;
      //check if event classNaames includes pause-event
      if (event.classNames.includes("pause-event")) {
        if (!confirm("Möchtest du die Pause bearbeiten?")) return;
        this.$router.push(`/admin/pause-times/${event.id}`);
      } else {
        this.$router.push(`/admin/bookees/${event.id}`);
      }
    },
    handleEventDrop(info) {
      const { event } = info;
      console.log(event);

      if (
        !confirm("Möchtest du den Termin von " + event.title + "verschieben?")
      ) {
        //reset event to original position
        info.revert();
        return;
      }
      const eventId = event.id;
      //format time to HH:MM
      const startTime = event.start.toTimeString().slice(0, 5);
      const eventIndex = this.calendarEvents.findIndex((e) => e.id == eventId);

      let eventToUpdate = this.calendarEvents[eventIndex].appointment;
      eventToUpdate.service_ids = eventToUpdate.services.map((service) => {
        return service.id;
      });
      let patchableBody = {
        name: eventToUpdate.name,
        date: eventToUpdate.date,
        email: eventToUpdate.email,
        phone: eventToUpdate.phone,
        time: startTime,
        service_ids: eventToUpdate.service_ids,
      };
      this.api()
        .updateAppointmentCalendar(eventId, patchableBody)
        .then((data) => this.updateEvent(data))
        .catch((error) => {
          if (error?.status === 401) {
            localStorage.removeItem("access_token");
            window.location.reload();
          }
          info.revert();
        });
    },
    handleResize(info) {
      const { event } = info;
      console.log(event);

      if (
        !confirm(
          "Möchtest du die Dauer des Termins von " + event.title + " anpassen?"
        )
      ) {
        //reset event to original position
        info.revert();
        return;
      }
      const eventId = event.id;
      //format time to HH:MM
      const startTime = event.start.toTimeString().slice(0, 5);
      const eventIndex = this.calendarEvents.findIndex((e) => e.id == eventId);

      let eventToUpdate = this.calendarEvents[eventIndex].appointment;
      eventToUpdate.service_ids = eventToUpdate.services.map((service) => {
        return service.id;
      });
      let patchableBody = {
        name: eventToUpdate.name,
        date: eventToUpdate.date,
        email: eventToUpdate.email,
        phone: eventToUpdate.phone,
        time: startTime,
        service_ids: eventToUpdate.service_ids,
        edited_duration: (event.end - event.start) / 60000,
      };

      this.api()
        .updateAppointmentCalendar(eventId, patchableBody)
        .then((data) => this.updateEvent(data))
        .catch((error) => {
          if (error?.status === 401) {
            localStorage.removeItem("access_token");
            window.location.reload();
          }
          info.revert();
        });
    },
    updateEvent(event) {
      const index = this.calendarEvents.findIndex((e) => e.id === event.id);
      if (index !== -1) {
        this.calendarEvents[index] = {
          id: event.id,
          title: event.title,
          start: event.start,
          end: event.end,
        };
      }
    },
    getBusinessHours() {
      this.api()
        .getBusinessHours(false)
        .then((data) => {
          const weekdays = [
            "Montag",
            "Dienstag",
            "Mittwoch",
            "Donnerstag",
            "Freitag",
            "Samstag",
            "Sonntag",
          ];
          const businessHours = data.map((day) => {
            if (day.offDay) return;
            return {
              daysOfWeek: [weekdays.indexOf(day.day)],
              startTime: day.from,
              endTime: day.to,
            };
          });
          this.calendarOptions.businessHours = businessHours;
        });
    },
    fetchNewAppointments(date) {
      this.loading = true;
      //format date yyyy-mm-dd
      const formattedStartDate = date.startStr.slice(0, 10);
      const formattedEndDate = date.endStr.slice(0, 10);
      this.api()
        .getBookees(formattedStartDate, formattedEndDate)
        .then((data) => {
          this.calendarEvents = data.map((appointment) => {
            let endTime = new Date(appointment.date + "T" + appointment.time);
            endTime.setMinutes(
              endTime.getMinutes() + appointment.edited_duration
                ? appointment.edited_duration
                : appointment.services.reduce(
                    (acc, service) => acc + service.step,
                    0
                  )
            );
            if (!appointment.cancelled) {
              return {
                id: appointment.id,
                title: appointment.customer?.name,
                start: new Date(appointment.date + "T" + appointment.time),
                appointment: appointment,
                end: endTime,
              };
            } else {
              return {
                id: appointment.id,
                title: appointment.customer?.name + " (abgesagt)",
                start: new Date(appointment.date + "T" + appointment.time),
                appointment: appointment,
                end: endTime,
                className: "cancelled-event",
              };
            }
          });

          this.calendarOptions.events = [
            ...this.calendarEvents,
            ...this.pauseEvents,
          ];
          this.loading = false;
          //add date to url
          const url = new URL(window.location.href);
          url.searchParams.set("start", formattedStartDate);
          url.searchParams.set("end", formattedEndDate);
          window.history.pushState({}, "", url);
        });
    },
    fetchAppointments() {
      this.api()
        .getBookees()
        .then((data) => {
          this.calendarEvents = data.map((appointment) => {
            let endTime = new Date(appointment.date + "T" + appointment.time);
            endTime.setMinutes(
              endTime.getMinutes() + appointment.edited_duration
                ? appointment.edited_duration
                : appointment.services.reduce(
                    (acc, service) => acc + service.step,
                    0
                  )
            );
            if (!appointment.cancelled) {
              return {
                id: appointment.id,
                title: appointment.customer?.name,
                start: new Date(appointment.date + "T" + appointment.time),
                appointment: appointment,
                end: endTime,
              };
            } else {
              return {
                id: appointment.id,
                title: appointment.customer?.name + " (abgesagt)",
                start: new Date(appointment.date + "T" + appointment.time),
                appointment: appointment,
                end: endTime,
                className: "cancelled-event",
              };
            }
          });

          this.calendarOptions.events = [
            ...this.calendarEvents,
            ...this.pauseEvents,
          ];
          this.loadingData = false;
        });
    },
    fetchPauseTimes() {
      this.api()
        .getPauseTimes()
        .then((data) => {
          console.log("Fetched pause times:", data); // Debugging-Ausgabe
          this.pauseEvents = data.map((pause) => {
            return {
              id: `${pause.id}-${pause.instance}`,
              title: pause.name ?? "Pause",
              start: new Date(pause.date + "T" + pause.start_time),
              end: new Date(pause.date + "T" + pause.end_time),
              className: "pause-event",
              extendedProps: {
                originalId: pause.id,
                instance: pause.instance,
                user_id: pause.user_id,
              },
            };
          });
          this.calendarOptions.events = [
            ...this.calendarEvents,
            ...this.pauseEvents,
          ];
          console.log("Current events:", this.calendarOptions.events); // Debugging-Ausgabe
        })
        .catch((error) => {
          console.error("Error fetching pause times:", error);
        });
    },
    setCalendarLayout() {
      const url = new URL(window.location.href);
      const calendarLayout = url.searchParams.get("calendarLayout");
      if (calendarLayout) {
        this.calendarOptions.initialView = calendarLayout;
      }
    },
    setCalendarInitialDate() {
      const url = new URL(window.location.href);
      const startDate = url.searchParams.get("start");
      const endDate = url.searchParams.get("end");
      if (startDate && endDate) {
        this.calendarOptions.initialDate = startDate;
      }
    },
  },
  mounted() {
    this.setCalendarInitialDate();
    this.fetchAppointments();
    this.getBusinessHours();
    this.fetchPauseTimes();
    this.setCalendarLayout();
  },
};
</script>

<style scoped>
.fc-toolbar-title {
  color: #e5e5e5 !important;
  font-size: 1.125rem !important;
}

.fc-timegrid-slot {
  border-color: #a3a3a3;
}

.fc-timegrid-slot-minor {
  border: none !important;
}

.fc-scrollgrid {
  border: none !important;
}

.fc-daygrid-day.fc-day-today,
.fc-timegrid-col.fc-day-today {
  background-color: #171717 !important;
}

.fc-view-harness {
  z-index: 0 !important;
}

.fc-scrollgrid-section-sticky > * {
  background-color: #171717 !important;
}

.fc-timegrid-slot-label-cushion,
.fc-col-header-cell-cushion {
  color: #e5e5e5;
}

.fc-button-primary {
  background-color: #8f6c3f !important;
}

.pause-event {
  background-color: #0084ff !important;
  color: #fff !important;
}

.cancelled-event {
  background-color: #530e0e !important;
  color: #fff !important;
}

.fc-event {
  cursor: pointer;
  margin: 5px 0;
  color: #fff;
}

.fc-daygrid-day-number {
  color: #e5e5e5;
}

.fc-event.fc-h-event.fc-daygrid-event.fc-daygrid-block-event.fc-event-start.fc-event-end {
  width: 100%;
}

.fc .fc-list-sticky .fc-list-day > * {
  border-color: #525252;
  background-color: #262626;
  color: #e5e5e5;
}

.fc .fc-list-event:hover td {
  background-color: #8f6c3f;
}

.fc-header-toolbar {
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  gap: 0.5rem !important;
}
</style>
