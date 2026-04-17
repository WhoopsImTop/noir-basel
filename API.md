# API-Dokumentation (barber-mo.com)

Diese Datei dokumentiert die im Frontend verwendeten API-Endpunkte, basierend auf den aktuellen Aufrufen im Repository.

## Basisinformationen

- API-Basis: `https://barber-mo.com/api`
- Versionierte Endpunkte:
  - `v2`: `https://barber-mo.com/api/v2/...`
  - unversioniert: `https://barber-mo.com/api/...`
- Authentifizierung:
  - Public-Endpunkte: kein Token notwendig
  - Admin-Endpunkte: `Authorization: Bearer <access_token>` aus `localStorage`
- Content-Type:
  - Bei JSON-Body: `Content-Type: application/json`

## Auth

### POST `/login`
- Zweck: Admin-Login
- Request:
  - `email: string`
  - `password: string`
- Response:
  - `200`: enthält `access_token`
  - `401`: falsche Credentials

## Services und Pricing

### GET `/service`
- Zweck: Liste aller Services (Buchungsschritt 1, Preiseite, Admin)
- Auth: optional/je nach Kontext
- Typische Felder pro Service:
  - `id`
  - `name`
  - `description`
  - `price`
  - `step` (Dauer in Minuten)
  - optional `old_price`, `price_adjustments_since`

### POST `/service`
- Zweck: Service anlegen (Admin)
- Auth: Bearer erforderlich

### PATCH `/service/:id`
- Zweck: Service bearbeiten (Admin)
- Auth: Bearer erforderlich

### DELETE `/service/:id`
- Zweck: Service löschen (Admin)
- Auth: Bearer erforderlich

### POST `/price-adjustments`
- Zweck: Preisanpassung anlegen (Admin)
- Auth: Bearer erforderlich

### PATCH `/price-adjustments/:id`
- Zweck: Preisanpassung aktualisieren (Admin)
- Auth: Bearer erforderlich

### DELETE `/price-adjustments/:id`
- Zweck: Preisanpassung löschen (Admin)
- Auth: Bearer erforderlich

## Settings

### GET `/v2/settings/?keys=<comma-separated-keys>`
- Zweck: Konfigurationswerte laden
- Auth: Bearer im Frontend gesetzt (auch auf Public-Seiten im aktuellen Code)
- Genutzte Keys:
  - `early_bird_time`
  - `late_booker_time`
  - `late_night_time`
  - `early_bird_price`
  - `late_booker_price`
  - `late_night_price`
- Response: Key-Value-Objekt, z. B.
  - `{ "early_bird_time": "09:30", "late_booker_time": "19:00" }`

### POST `/v2/settings`
- Zweck: Settings speichern (Admin)
- Auth: Bearer erforderlich

## Öffnungszeiten und Urlaub

### GET `/business-hours`
- Zweck: Öffnungszeiten laden
- Auth:
  - Public im Kalender-Kontext
  - Bearer im Admin-Kontext
- Typische Felder:
  - `id`, `day`, `from`, `to`, `off_day`

### POST `/business-hours`
- Zweck: Öffnungszeiten speichern (Admin)
- Auth: Bearer erforderlich
- Request: Array von Tagesobjekten (inkl. `off_day` als 0/1)

### GET `/holidays`
- Zweck: Urlaubstage laden (Admin)
- Auth: Bearer erforderlich

### POST `/holidays`
- Zweck: Urlaubszeitraum anlegen (Admin)
- Auth: Bearer erforderlich
- Request:
  - `from_date: YYYY-MM-DD`
  - `to_date: YYYY-MM-DD`
- Response enthält zusätzlich:
  - `conflicting_appointments` (Termine im Urlaubszeitraum)

### DELETE `/holidays/:id`
- Zweck: Urlaubstag löschen (Admin)
- Auth: Bearer erforderlich

## Pausen

### GET `/pause-times`
- Zweck: Pausen laden (Admin-Kalender)
- Auth: Bearer erforderlich

### POST `/pause-times`
- Zweck: Pause anlegen (Admin)
- Auth: Bearer erforderlich
- Request-Felder (typisch):
  - `date`
  - `start_time`
  - `end_time`
  - `duration`
  - `name`
  - `customer_id` (oft `null`)
  - `user_id`
  - optional: `recurring_type`, `recurring_day`, `recurring_end_date`

### GET `/pause-times/:id`
- Zweck: Pausendetails laden (Admin)
- Auth: Bearer erforderlich

### PATCH `/pause-times/:id`
- Zweck: Pause aktualisieren (Admin)
- Auth: Bearer erforderlich

### DELETE `/pause-times/:id`
- Zweck: Pause löschen (Admin)
- Auth: Bearer erforderlich

## Terminbuchung (Public)

### GET `/v2/appointments?service_id=<ids>&week=<number>`
- Zweck: Freie Slots für gewählte Services und Kalenderwoche
- Auth: keines
- Parameter:
  - `service_id`: CSV-Liste, z. B. `1,3`
  - `week`: Offset, z. B. `0` aktuelle Woche
- Response (typisch):
  - `{ "dates": [ { "date": "YYYY-MM-DD", "times": ["09:00", ...] } ] }`

### GET `/v2/checkout?service_id=<ids>&date=<YYYY-MM-DD>&time=<HH:mm>`
- Zweck: Preisberechnung für konkrete Auswahl
- Auth: keines
- Response: Liste der Services mit ggf. Anpassungen

### POST `/v2/appointments`
- Zweck: Termin als Kunde buchen
- Auth: keines
- Request-Felder:
  - `service_ids: string[] | number[]`
  - `date: YYYY-MM-DD`
  - `time: HH:mm`
  - `phone: string` (validiert, i. d. R. E.164)
  - `email: string`
  - `name: string`
  - optional: `instagram`, `birthday`, `notes`
- Relevante Statuscodes:
  - `201`: erstellt
  - `422`: Validierungs-/Businessfehler (z. B. Slot schon belegt)

### GET `/v2/appointments/cancel/:key`
- Zweck: Kundenseitige Stornierung via Link/Key
- Auth: keines
- Hinweis: wird im Frontend per `GET` aufgerufen

## Termine (Admin)

### GET `/v2/bookees`
- Zweck: Termine laden (Admin-Kalender)
- Auth: Bearer erforderlich
- Optional Query:
  - `start=YYYY-MM-DD`
  - `end=YYYY-MM-DD`

### GET `/v2/appointments/:id`
- Zweck: Einzeltermin laden (Admin-Detailseite / Edit)
- Auth: Bearer erforderlich

### PATCH `/v2/appointments/:id`
- Zweck: Termin aktualisieren (Admin)
- Auth: Bearer erforderlich
- Typische Felder:
  - `service_ids`
  - `date`, `time`
  - `edited_duration`
  - `name`, `email`, `phone`
  - optional: `notes`, `instagram`, `birthday`, `user_id`

### PATCH `/appointments/:id`
- Zweck: Termin aus FullCalendar per Drag/Resize anpassen
- Auth: Bearer erforderlich
- Hinweis: unversionierter Endpunkt wird in einer Komponente verwendet

### POST `/v2/bookee-cancellation`
- Zweck: Admin-Stornierung eines Termins
- Auth: Bearer erforderlich
- Request:
  - `{ "id": <appointment_id> }`

### POST `/v2/appointments/hasPayed/:id`
- Zweck: Termin als bezahlt markieren
- Auth: Bearer erforderlich
- Request:
  - `{ "amount": number }`

### POST `/v2/appointment-booking-admin`
- Zweck: Termin im Admin manuell anlegen
- Auth: Bearer erforderlich
- Request (typisch):
  - `service_ids`
  - `date`
  - `time`
  - optional: `edited_duration`
  - entweder `customer_id` oder `name`/`email`/`phone`

### GET `/v2/appointment-admin-times?service_ids=<ids>&date=<date>`
- Zweck: Vorschlagszeiten für Admin-Modal
- Auth: Bearer erforderlich

## Kunden / Reporting

### GET `/v2/customers`
- Zweck: Kundenliste laden
- Auth: Bearer erforderlich

### GET `/v2/customers/:id`
- Zweck: Kundendetails laden (Reporting)
- Auth: Bearer erforderlich

### PATCH `/v2/customers/:id`
- Zweck: Kundendaten aktualisieren
- Auth: Bearer erforderlich

### DELETE `/v2/customers/:id`
- Zweck: Kunde löschen
- Auth: Bearer erforderlich

### POST `/v2/customer/:id/blockCustomer`
- Zweck: Kunde blockieren
- Auth: Bearer erforderlich

### GET `/revenue?month=<n>`
- Zweck: Umsatzdaten für Statistik
- Auth: Bearer erforderlich

## Hinweise zu Inkonsistenzen im aktuellen Frontend

- Gemischte Nutzung von `/api/v2/...` und `/api/...` für ähnliche Ressourcen (`appointments`).
- Public-Seiten lesen teilweise `/v2/settings` mit Bearer-Header, obwohl oft kein Token existiert.
- Fehlende zentrale API-Schicht: Fetch-Aufrufe sind verteilt über Pages/Components.
- Error-Handling ist uneinheitlich (`alert`, `window.alert`, stilles `console.error`).

## Empfohlene Standardisierung (optional, für nächsten Refactor)

- Einheitliche API-Version für Termin-Endpunkte (`v2` bevorzugt).
- Gemeinsamer API-Client mit:
  - `baseURL`
  - optionalem Auth-Interceptor
  - konsistentem Fehlerobjekt
- Klare Trennung:
  - Public booking API
  - Admin API
- Typdefinitionen (z. B. `types/api.ts`) für:
  - Service
  - Appointment
  - CheckoutItem
  - Customer
  - PauseTime
