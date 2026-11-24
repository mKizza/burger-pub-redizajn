export const MAX_GUESTS = 20;
export const TIME_ZONE = "Europe/Berlin";

export const LIMITS = { name: 100, email: 200, phone: 40, message: 2000 };

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_PATTERN = /^[0-9+()/\-\s]{6,}$/;

export function nowInMunich(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

export function addDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
}

export function isValidIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export function formatDateGerman(isoDate) {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

export function guestsLabel(count) {
  return Number(count) === 1 ? "1 Person" : `${count} Personen`;
}

export function validateReservation(values, now = new Date()) {
  const errors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const phone = values.phone.trim();
  const guests = Number(values.guests);
  const today = nowInMunich(now);

  if (!values.date) {
    errors.date = "Bitte wähle ein Datum.";
  } else if (!isValidIsoDate(values.date)) {
    errors.date = "Bitte wähle ein gültiges Datum.";
  } else if (values.date < today.date) {
    errors.date = "Das Datum liegt in der Vergangenheit.";
  }

  if (!values.time) {
    errors.time = "Bitte wähle eine Uhrzeit.";
  } else if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(values.time)) {
    errors.time = "Bitte wähle eine gültige Uhrzeit.";
  } else if (
    !errors.date &&
    values.date === today.date &&
    values.time <= today.time
  ) {
    errors.time = "Die Uhrzeit liegt in der Vergangenheit.";
  }

  if (!Number.isInteger(guests) || guests < 1 || guests > MAX_GUESTS) {
    errors.guests = `Online kannst du für 1 bis ${MAX_GUESTS} Personen reservieren. Für größere Gruppen ruf uns bitte an.`;
  }

  if (!name) {
    errors.name = "Bitte gib deinen Namen an.";
  } else if (name.length > LIMITS.name) {
    errors.name = `Maximal ${LIMITS.name} Zeichen.`;
  }

  if (!email) {
    errors.email = "Bitte gib deine E-Mail-Adresse an.";
  } else if (email.length > LIMITS.email || !EMAIL_PATTERN.test(email)) {
    errors.email = "Bitte gib eine gültige E-Mail-Adresse an.";
  }

  if (!phone) {
    errors.phone = "Bitte gib deine Telefonnummer an.";
  } else if (phone.length > LIMITS.phone || !PHONE_PATTERN.test(phone)) {
    errors.phone = "Bitte gib eine gültige Telefonnummer an.";
  }

  if (values.message.trim().length > LIMITS.message) {
    errors.message = `Maximal ${LIMITS.message} Zeichen.`;
  }

  return errors;
}

export function validateContact(values) {
  const errors = {};
  const email = values.email.trim();

  if (!values.name.trim()) {
    errors.name = "Bitte gib deinen Namen an.";
  }

  if (!email) {
    errors.email = "Bitte gib deine E-Mail-Adresse an.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Bitte gib eine gültige E-Mail-Adresse an.";
  }

  if (!values.message.trim()) {
    errors.message = "Bitte schreib uns eine Nachricht.";
  }

  return errors;
}
