import { describe, expect, it } from "vitest";
import {
  addDays,
  formatDateGerman,
  guestsLabel,
  isValidIsoDate,
  nowInMunich,
  validateContact,
  validateReservation,
} from "./reservation";

// 24.11.2026, 18:30 u Münchenu (UTC+1)
const NOW = new Date("2026-11-24T17:30:00Z");

const valid = {
  date: "2026-11-25",
  time: "19:30",
  guests: 4,
  name: "Max Mustermann",
  email: "max@example.de",
  phone: "+49 89 123456",
  message: "",
};

describe("nowInMunich", () => {
  it("gives Munich's date and time, not the machine's", () => {
    expect(nowInMunich(NOW)).toEqual({ date: "2026-11-24", time: "18:30" });
  });

  it("is already the next day in Munich shortly before midnight UTC", () => {
    expect(nowInMunich(new Date("2026-11-24T23:30:00Z"))).toEqual({ date: "2026-11-25", time: "00:30" });
  });

  it("follows summer time (UTC+2)", () => {
    expect(nowInMunich(new Date("2026-07-01T10:00:00Z"))).toEqual({ date: "2026-07-01", time: "12:00" });
  });
});

describe("addDays", () => {
  it("crosses months and years", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  });
});

describe("isValidIsoDate", () => {
  it("accepts real dates only", () => {
    expect(isValidIsoDate("2026-02-28")).toBe(true);
    expect(isValidIsoDate("2026-02-30")).toBe(false);
    expect(isValidIsoDate("24.11.2026")).toBe(false);
    expect(isValidIsoDate("")).toBe(false);
  });
});

describe("formatDateGerman", () => {
  it("writes the weekday and the month in German", () => {
    expect(formatDateGerman("2026-11-27")).toBe("Freitag, 27. November");
  });
});

describe("guestsLabel", () => {
  it("says Person for one and Personen otherwise", () => {
    expect(guestsLabel(1)).toBe("1 Person");
    expect(guestsLabel("6")).toBe("6 Personen");
  });
});

describe("validateReservation", () => {
  it("accepts a complete request for tomorrow", () => {
    expect(validateReservation(valid, NOW)).toEqual({});
  });

  it("names every missing field", () => {
    const errors = validateReservation(
      { date: "", time: "", guests: "", name: " ", email: "", phone: "", message: "" },
      NOW,
    );

    expect(errors).toEqual({
      date: "Bitte wähle ein Datum.",
      time: "Bitte wähle eine Uhrzeit.",
      guests: "Online kannst du für 1 bis 20 Personen reservieren. Für größere Gruppen ruf uns bitte an.",
      name: "Bitte gib deinen Namen an.",
      email: "Bitte gib deine E-Mail-Adresse an.",
      phone: "Bitte gib deine Telefonnummer an.",
    });
  });

  it("refuses a date in the past and a time already gone today", () => {
    expect(validateReservation({ ...valid, date: "2026-11-23" }, NOW).date).toBe(
      "Das Datum liegt in der Vergangenheit.",
    );
    expect(validateReservation({ ...valid, date: "2026-11-24", time: "18:30" }, NOW).time).toBe(
      "Die Uhrzeit liegt in der Vergangenheit.",
    );
    expect(validateReservation({ ...valid, date: "2026-11-24", time: "18:31" }, NOW)).toEqual({});
  });

  it("refuses dates that don't exist and malformed times", () => {
    expect(validateReservation({ ...valid, date: "2026-02-30" }, NOW).date).toBe(
      "Bitte wähle ein gültiges Datum.",
    );
    expect(validateReservation({ ...valid, time: "25:00" }, NOW).time).toBe(
      "Bitte wähle eine gültige Uhrzeit.",
    );
  });

  it.each([0, 21, 2.5, "abc"])("refuses %s guests", (guests) => {
    expect(validateReservation({ ...valid, guests }, NOW).guests).toMatch(/1 bis 20 Personen/);
  });

  it.each([1, 20, "8"])("accepts %s guests", (guests) => {
    expect(validateReservation({ ...valid, guests }, NOW).guests).toBeUndefined();
  });

  it("checks the email and phone like the API does", () => {
    expect(validateReservation({ ...valid, email: "max@example" }, NOW).email).toBe(
      "Bitte gib eine gültige E-Mail-Adresse an.",
    );
    expect(validateReservation({ ...valid, phone: "12345" }, NOW).phone).toBe(
      "Bitte gib eine gültige Telefonnummer an.",
    );
    expect(validateReservation({ ...valid, phone: "0176/123-45 (6)" }, NOW).phone).toBeUndefined();
  });

  it("enforces the API's length limits", () => {
    const errors = validateReservation(
      {
        ...valid,
        name: "x".repeat(101),
        email: `${"x".repeat(195)}@ex.de`,
        message: "x".repeat(2001),
      },
      NOW,
    );

    expect(Object.keys(errors).sort()).toEqual(["email", "message", "name"]);
  });
});

describe("validateContact", () => {
  it("accepts a complete message", () => {
    expect(validateContact({ name: "Anna", email: "anna@example.de", message: "Hallo!" })).toEqual({});
  });

  it("names missing fields and a bad email", () => {
    expect(validateContact({ name: "", email: "anna", message: "  " })).toEqual({
      name: "Bitte gib deinen Namen an.",
      email: "Bitte gib eine gültige E-Mail-Adresse an.",
      message: "Bitte schreib uns eine Nachricht.",
    });
  });
});
