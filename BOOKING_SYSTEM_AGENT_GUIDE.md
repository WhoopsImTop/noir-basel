# Buchungssystem: Detaillierte Agent-Anleitung

Diese Anleitung beschreibt, wie das Buchungssystem in diesem Projekt funktioniert und wie ein anderer Agent es funktional nachbauen kann.

## 1) Zielbild und Scope

Das System besteht aus zwei Flows:

- Public-Flow für Kund:innen (`/online-booking/...`)
- Admin-Flow für interne Verwaltung (`/admin/...`)

Zentrale fachliche Ziele:

- Services auswählen
- freie Zeitfenster abhängig von Services ermitteln
- dynamische Preise für gewählten Slot anzeigen
- Termin anlegen
- Termin via Link stornieren
- intern Termine, Pausen, Öffnungszeiten und Urlaub verwalten

## 2) Tech- und Laufzeitrahmen

- Framework: Nuxt 3 mit Vue 3
- Rendering: `ssr: false` (Client-only)
- State: Pinia Stores
- i18n: Deutsch/Englisch via `@nuxtjs/i18n`
- API-Kommunikation direkt per `fetch` auf `https://barber-mo.com/api/...`
- Auth im Admin über `access_token` in `localStorage`

Wichtig für Nachbau:

- Das Projekt baut stark auf Client-seitiges Routing plus URL-Parameter.
- Termin-relevante Zustände werden nicht zentral im Store gehalten, sondern primär per Route-Parametern übergeben.

## 3) Routing-Design des Public-Flows

Der Buchungsflow verwendet 3 aufeinanderfolgende Seiten:

1. Service-Auswahl  
   `pages/online-booking/index.vue`

2. Datum/Uhrzeit-Auswahl  
   `pages/online-booking/date-[service].vue`
   - `service` ist CSV-Liste der Service-IDs, z. B. `1,3`

3. Kundendaten + Termin bestätigen  
   `pages/online-booking/booking-[service]_[date]_[time].vue`
   - Route enthält alle benötigten Buchungsparameter

Abschluss:

- Erfolg: `pages/online-booking/success.vue`
- Storno durch Kunde: `pages/online-booking/cancellation.vue` -> `cancelled.vue`

## 4) Public-Flow im Detail (Schritt für Schritt)

## Schritt 1: Services wählen

Datei: `pages/online-booking/index.vue`

Verhalten:

- Lädt Services via `GET /api/service`
- Mehrfachauswahl per Checkbox (lokaler State `selectedService`)
- Beim Klick auf Weiter:
  - IDs werden CSV-String
  - Navigation zu `/online-booking/date-<csv>`

Zusatz:

- Lädt Buchungsrelevante Zeiten via `GET /api/v2/settings/?keys=early_bird_time,late_booker_time`
- Zeigt Preis-Hinweistext für Aufschläge außerhalb Kernzeiten

Replikationshinweis:

- Service-IDs als URL-Quelle beibehalten, damit Deep-Linking und Reload robust bleiben.

## Schritt 2: Freie Termine + Checkout

Datei: `pages/online-booking/date-[service].vue`

Input:

- `route.params.service` (CSV-IDs)

Verhalten:

- Lädt freie Slots pro Woche mit:
  - `GET /api/v2/appointments?service_id=<ids>&week=<offset>`
- Unterstützt Vor-/Zurückblättern in Wochen (`appointmentWeek`)
- Pro Tageskarte: Liste freier Uhrzeiten
- Bei Auswahl eines Slots:
  - `selectedDate`, `selectedTime` setzen
  - `GET /api/v2/checkout?service_id=<ids>&time=<HH:mm>&date=<YYYY-MM-DD>`
  - Gesamtpreis aus Response summieren

Filtermechanik:

- UI-Filter blendet Timeslots per DOM-Manipulation ein/aus:
  - alle
  - ab 12
  - ab 15
  - ab 18

Preislogik-Anzeige:

- Zusätzliche Settings:
  - `early_bird_time`, `late_booker_time`, `late_night_time`
- Zeiten werden intern minimal verschoben, um Vergleichsgrenzen zu formen
- `generateStyles` markiert Slots mit Aufschlag-Optik

Weiter-Navigation:

- zu `/online-booking/booking-<serviceCSV>_<date>_<time>`

Replikationshinweis:

- Die fachliche Verfügbarkeit kommt aus dem Backend; Frontend berechnet keine Slot-Kollisionen selbst.

## Schritt 3: Kundendaten erfassen und buchen

Datei: `pages/online-booking/booking-[service]_[date]_[time].vue`

Input:

- Route-Parameter: `service`, `date`, `time`

Formfelder:

- Pflicht: Vorname, Nachname, E-Mail, Mobilnummer, AGB/Datenschutz-Checkbox
- Optional: Geburtstag, Instagram, Nachricht

Validierung:

- E-Mail: einfache Zeichenprüfung (`@` und `.`)
- Telefon:
  - Country-Prefix (`+49`, `+41`, ...)
  - Validierung über `libphonenumber-js/max`
  - akzeptiert nur Typ `"MOBILE"`
  - speichert normalisierte Nummer (`validatedPhoneNumber`)

Buchung:

- POST auf `/api/v2/appointments`
- Body:
  - `service_ids` aus CSV
  - `date`, `time`
  - `phone`, `email`, `name`
  - optional `instagram`, `birthday`, `notes`

Response-Handling:

- `201`: Erfolg
  - Buchungsobjekt in `localStorage.booking`
  - Redirect zu `/online-booking/success`
- `422`: Business-/Validierungsfehler
  - Message aus Backend anzeigen
  - zurück zur Slot-Auswahl
- sonst: generischer Fehler und zurück

## Schritt 4: Erfolg anzeigen

Datei: `pages/online-booking/success.vue`

Verhalten:

- liest `localStorage.booking`
- zeigt Datum/Uhrzeit und Standort
- entfernt `localStorage.booking` beim Verlassen

Replikationshinweis:

- Diese Seite ist rein präsentational; die echte Persistenz liegt im Backend.

## Schritt 5: Kundenseitige Stornierung

Datei: `pages/online-booking/cancellation.vue`

Input über Query-Parameter:

- `key` (Storno-Key)
- `date`
- `time`
- `services`

Flow:

- Termininfos visualisieren
- Checkbox als Sicherheitsbestätigung
- `GET /api/v2/appointments/cancel/<key>`
- bei Erfolg Redirect auf `/online-booking/cancelled`

## 5) Admin-Flow im Detail

## Auth und Guard

- Login-Seite: `pages/admin/auth/login.vue`
- Middleware: `middleware/auth.js`
  - schützt `/admin...`
  - prüft `localStorage.access_token`
  - lädt Kundenbasisdaten über `useCustomerStore().fetch()`

## Admin-Kalender und Tagesliste

Hauptkomponenten:

- `components/calendarComponent.vue` (Monats-/Tagesliste)
- `components/bookingCalendarComponent.vue` (FullCalendar-Ansicht)

Funktionen:

- Termine laden:
  - `GET /api/v2/bookees?start=<date>&end=<date>`
- Pausen laden:
  - `GET /api/pause-times`
- Termin öffnen:
  - Route `/admin/bookees/:id`
- Drag/Drop/Resize in FullCalendar:
  - `PATCH /api/appointments/:id`

## Termin-Detail und Bearbeitung

Dateien:

- `pages/admin/bookees/[id].vue` (Detail + stornieren)
- `pages/admin/bookees/edit-[id].vue` (editieren)

Aktionen:

- Termin laden: `GET /api/v2/appointments/:id`
- Termin stornieren: `POST /api/v2/bookee-cancellation`
- Termin patchen: `PATCH /api/v2/appointments/:id`

## Termin/Pause hinzufügen (Modal)

Datei: `components/bookingModal.vue`

Zwei Modi:

- Pause erstellen:
  - `POST /api/pause-times`
  - optional mit Wiederholung
- Termin erstellen:
  - `POST /api/v2/appointment-booking-admin`
  - mit bestehendem `customer_id` oder ad-hoc Kundendaten
  - Zeitslot-Vorschläge über:
    - `GET /api/v2/appointment-admin-times?service_ids=...&date=...`

## Öffnungszeiten und Urlaub

Datei: `pages/admin/opening-hours.vue`

Öffnungszeiten:

- laden: `GET /api/business-hours`
- speichern: `POST /api/business-hours`

Urlaub:

- laden: `GET /api/holidays`
- speichern: `POST /api/holidays`
  - Backend liefert `conflicting_appointments`
- Konflikttermine gesammelt stornieren:
  - `POST /api/v2/bookee-cancellation`
- Urlaub löschen:
  - `DELETE /api/holidays/:id`

## Zahlung markieren

In `components/calendarComponent.vue`:

- vergangene, unbezahlte Termine können als bezahlt markiert werden
- Endpoint:
  - `POST /api/v2/appointments/hasPayed/:id` mit `{ amount }`

## 6) Datenverträge (praktische Minimaltypen)

Diese Typen reichen für einen funktionalen Nachbau:

- Service:
  - `id`, `name`, `description`, `price`, `step`
- AvailabilityDay:
  - `date`, `times: string[]`
- CheckoutItem:
  - `id`, `name`, `price`, optional `old_price`, `price_adjustments_since`
- AppointmentCreatePayload:
  - `service_ids`, `date`, `time`, `phone`, `email`, `name`, optional Felder
- Appointment:
  - `id`, `date`, `time`, `services[]`, `customer`, `cancelled`, optional `edited_duration`, `amount`, `isPayed`
- PauseTime:
  - `id`, `date`, `start_time`, `end_time`, optional recurrence-Felder

## 7) Konkreter Bauplan für einen anderen Agenten

Wenn ein Agent das System neu bauen soll, kann er diese Reihenfolge nutzen:

1. **API-Client bauen**
   - `baseURL`, JSON-Helpers, optional Bearer-Injektion
   - Fehlerformat standardisieren

2. **Domain-Modelle definieren**
   - TypeScript-Interfaces für Service, Appointment, Checkout, Customer

3. **Public Booking implementieren**
   - Seite A: Service-Auswahl (`/service`)
   - Seite B: Slot-Auswahl (`/v2/appointments`)
   - Seite C: Formular + Validierung + POST (`/v2/appointments`)
   - Seite D: Erfolg aus lokaler Session
   - Seite E: Storno per Key

4. **Admin Auth + Guard**
   - Login, Token speichern, Guard/Middleware

5. **Admin Kalender**
   - Monat-/Listendarstellung
   - Laden von Bookees + Pausen
   - Detailroute pro Termin

6. **Admin Operationen**
   - Termin editieren/stornieren
   - Pause anlegen/bearbeiten
   - Termin manuell erstellen
   - Öffnungszeiten/Urlaub pflegen

7. **Abnahmefälle testen**
   - Multi-Service-Buchung
   - 422 bei Slot-Kollision
   - Storno-Link
   - Urlaub mit Konflikterminen
   - Terminverschiebung + Bezahlmarkierung

## 8) Kritische Implementierungsdetails

- Service-Auswahl muss Mehrfachauswahl unterstützen (CSV-IDs in URL).
- Slotliste ist vollständig backendgetrieben; keine eigene Kollisionslogik im Frontend.
- `checkout` vor finalem POST aufrufen, damit Preis/Anpassungen sichtbar sind.
- Telefonnummer sollte normalisiert gespeichert werden (E.164).
- Admin-Endpunkte müssen Bearer-Token mitführen.
- Bei 401 im Admin: Token entfernen und auf Login weiterleiten.

## 9) Bekannte Schwachstellen im aktuellen Stand (für sauberen Neubau)

- Inkonsistente Endpunktversionen (`/appointments` vs `/v2/appointments`).
- Public Settings-Aufruf nutzt Bearer, obwohl User i. d. R. nicht eingeloggt ist.
- Keine zentrale API-Abstraktion -> duplizierte Fetch-Logik.
- Teilweise direkte DOM-Manipulation statt reaktiver Vue-State-Filter.

## 10) Empfehlung für den Nachbau

Ein neuer Agent sollte das Verhalten fachlich gleich halten, aber technisch aufräumen:

- API-Layer zentralisieren
- Endpunkte konsequent versionieren
- Validierung robust machen (z. B. Schema-Validator)
- Fehlerfälle und Retry/Feedback vereinheitlichen
- E2E-Tests für den 3-Schritt-Buchungsflow plus Admin-Storno ergänzen
