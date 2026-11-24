import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { addDays, nowInMunich } from "../lib/reservation";
import { menuRoutes } from "../test/fixtures";
import { deferred, mockApi } from "../test/mockApi";
import { renderApp } from "../test/renderApp";

const today = nowInMunich().date;
const tomorrow = addDays(today, 1);

async function renderContact(routes = {}) {
  const api = mockApi({ ...menuRoutes(), ...routes });
  const screen = await renderApp("/contact");
  const reservation = screen.getByRole("form", { name: "Reservierungsanfrage" });

  return { api, screen, reservation };
}

async function fillReservation(form, overrides = {}) {
  const values = {
    date: tomorrow,
    time: "19:30",
    name: "Max Mustermann",
    email: "max@example.de",
    phone: "+49 89 123456",
    ...overrides,
  };

  await form.getByLabelText("Datum").fill(values.date);
  await form.getByLabelText("Uhrzeit").fill(values.time);
  await form.getByLabelText("Name").fill(values.name);
  await form.getByLabelText("E-Mail").fill(values.email);
  await form.getByLabelText("Telefon").fill(values.phone);
}

describe("contact details", () => {
  it("links address, phone, email and Instagram", async () => {
    const { screen } = await renderContact();
    const details = screen.getByRole("region", { name: "Kontaktdaten" });

    await expect.element(details.getByRole("link", { name: /Telefon/ })).toHaveAttribute("href", "tel:+498932795957");
    await expect
      .element(details.getByRole("link", { name: /E-Mail/ }))
      .toHaveAttribute("href", "mailto:burgerpubmunchen@gmail.com");
    await expect
      .element(details.getByRole("link", { name: /Instagram/ }))
      .toHaveAttribute("href", "https://www.instagram.com/burgerpubmunchen_/");
    await expect
      .element(details.getByRole("link", { name: /Adresse/ }))
      .toHaveAttribute("href", expect.stringContaining("google.com/maps/dir"));
  });

  it("loads the Google map only when asked", async () => {
    const { screen } = await renderContact();

    await expect.element(screen.getByTitle(/Karte: Burger Pub München/)).not.toBeInTheDocument();
    await expect.element(screen.getByText("Beim Laden der Karte werden Daten an Google übertragen.")).toBeVisible();

    await screen.getByRole("button", { name: "Karte laden" }).click();
    await expect
      .element(screen.getByTitle(/Karte: Burger Pub München/))
      .toHaveAttribute("src", expect.stringContaining("output=embed"));
  });
});

describe("reservation form", () => {
  it("explains every missing field and focuses the first one", async () => {
    const { api, reservation } = await renderContact();

    await reservation.getByLabelText("Name").fill("   ");
    await reservation.getByRole("button", { name: "Reservierung anfragen" }).click();

    await expect.element(reservation.getByText("Bitte wähle ein Datum.")).toBeVisible();
    await expect.element(reservation.getByText("Bitte wähle eine Uhrzeit.")).toBeVisible();
    await expect.element(reservation.getByText("Bitte gib deinen Namen an.")).toBeVisible();
    await expect.element(reservation.getByText("Bitte gib deine E-Mail-Adresse an.")).toBeVisible();
    await expect.element(reservation.getByText("Bitte gib deine Telefonnummer an.")).toBeVisible();
    await expect.element(reservation.getByLabelText("Datum")).toHaveFocus();
    await expect.element(reservation.getByLabelText("Datum")).toHaveAttribute("aria-invalid", "true");
    await expect
      .element(reservation.getByLabelText("Name"))
      .toHaveAccessibleDescription("Bitte gib deinen Namen an.");
    expect(api.callsTo("POST", "/api/reservations")).toHaveLength(0);
  });

  it("checks a field when leaving it, not while the guest is still typing", async () => {
    const { reservation } = await renderContact();
    const email = reservation.getByLabelText("E-Mail");

    await email.fill("max@");
    await expect.element(reservation.getByText("Bitte gib eine gültige E-Mail-Adresse an.")).not.toBeInTheDocument();

    await reservation.getByLabelText("Telefon").click();
    await expect.element(reservation.getByText("Bitte gib eine gültige E-Mail-Adresse an.")).toBeVisible();

    await email.fill("max@example.de");
    await expect.element(reservation.getByText("Bitte gib eine gültige E-Mail-Adresse an.")).not.toBeInTheDocument();
  });

  it("refuses a time already gone today", async () => {
    const { reservation } = await renderContact();

    await reservation.getByRole("button", { name: "Heute" }).click();
    await expect.element(reservation.getByLabelText("Datum")).toHaveValue(today);
    await expect.element(reservation.getByRole("button", { name: "Heute" })).toHaveAttribute("aria-pressed", "true");

    await reservation.getByLabelText("Uhrzeit").fill("00:00");
    await reservation.getByLabelText("Name").click();

    if (nowInMunich().time !== "00:00") {
      await expect.element(reservation.getByText("Die Uhrzeit liegt in der Vergangenheit.")).toBeVisible();
    }
  });

  it("counts guests between 1 and 20 with the stepper", async () => {
    const { reservation } = await renderContact();
    const guests = reservation.getByRole("spinbutton", { name: "Personen" });
    const fewer = reservation.getByRole("button", { name: "Eine Person weniger" });
    const more = reservation.getByRole("button", { name: "Eine Person mehr" });

    await expect.element(guests).toHaveValue(2);
    await fewer.click();
    await expect.element(guests).toHaveValue(1);
    await expect.element(fewer).toBeDisabled();

    await guests.fill("20");
    await expect.element(more).toBeDisabled();

    await guests.fill("25");
    await reservation.getByLabelText("Name").click();
    await expect.element(reservation.getByText(/Online kannst du für 1 bis 20 Personen reservieren/)).toBeVisible();
  });

  it("sends the request and confirms it with a summary", async () => {
    const pending = deferred();
    const { api, reservation, screen } = await renderContact({
      "POST /api/reservations": () => pending.promise,
    });

    await reservation.getByRole("button", { name: "Morgen" }).click();
    await fillReservation(reservation, { name: "Max Mustermann" });
    await reservation.getByRole("button", { name: "Eine Person mehr" }).click();
    await reservation.getByRole("textbox", { name: "Nachricht" }).fill("Geburtstag");
    await reservation.getByRole("button", { name: "Reservierung anfragen" }).click();

    await expect.element(screen.getByRole("button", { name: "Wird gesendet …" })).toBeDisabled();
    pending.resolve({ json: { status: "success", message: "Reservierungsanfrage erfolgreich gesendet." } });

    await expect.element(screen.getByRole("heading", { name: "Danke, Max!" })).toHaveFocus();
    await expect.element(screen.getByText(/Deine Anfrage ist bei uns angekommen/)).toBeVisible();
    await expect.element(screen.getByText("3 Personen")).toBeVisible();
    await expect.element(screen.getByText("19:30 Uhr")).toBeVisible();

    expect(api.callsTo("POST", "/api/reservations")[0].body).toEqual({
      date: tomorrow,
      time: "19:30",
      guests: 3,
      name: "Max Mustermann",
      email: "max@example.de",
      phone: "+49 89 123456",
      message: "Geburtstag",
    });

    await screen.getByRole("button", { name: "Neue Anfrage" }).click();
    const fresh = screen.getByRole("form", { name: "Reservierungsanfrage" });
    await expect.element(fresh.getByLabelText("Name")).toHaveValue("");
    await expect.element(fresh.getByRole("spinbutton", { name: "Personen" })).toHaveValue(2);
  });

  it("shows the API's own message for a refused request", async () => {
    const { reservation } = await renderContact({
      "POST /api/reservations": {
        status: 400,
        json: { status: "fail", message: "Bitte gib eine gültige Telefonnummer an." },
      },
    });

    await fillReservation(reservation);
    await reservation.getByRole("button", { name: "Reservierung anfragen" }).click();

    await expect
      .element(reservation.getByRole("alert"))
      .toHaveTextContent("Bitte gib eine gültige Telefonnummer an.");
    await expect.element(reservation.getByLabelText("Name")).toHaveValue("Max Mustermann");
  });

  it("offers the phone number when sending fails", async () => {
    const { reservation } = await renderContact({
      "POST /api/reservations": {
        status: 500,
        json: { status: "error", message: "Reservierungsanfrage konnte nicht gesendet werden." },
      },
    });

    await fillReservation(reservation);
    await reservation.getByRole("button", { name: "Reservierung anfragen" }).click();

    const alert = reservation.getByRole("alert");
    await expect.element(alert).toMatchTextContent(/Anfrage konnte nicht gesendet werden\. Bitte ruf uns an/);
    await expect.element(alert.getByRole("link", { name: "+49 89 32795957" })).toHaveAttribute("href", "tel:+498932795957");
    await expect.element(reservation.getByRole("button", { name: "Reservierung anfragen" })).toBeEnabled();
  });

  it("picks a date with the keyboard", async () => {
    const { reservation } = await renderContact();

    await reservation.getByLabelText("Uhrzeit").click();
    await userEvent.tab({ shift: true });
    await expect.element(reservation.getByRole("button", { name: "Morgen" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect.element(reservation.getByLabelText("Datum")).toHaveValue(tomorrow);
  });

  it("doesn't let a validation message on blur swallow the click on the button", async () => {
    const { reservation } = await renderContact();

    await reservation.getByLabelText("E-Mail").fill("max@");
    await reservation.getByRole("button", { name: "Reservierung anfragen" }).click();

    await expect.element(reservation.getByText("Bitte wähle ein Datum.")).toBeVisible();
    await expect.element(reservation.getByLabelText("Datum")).toHaveFocus();
  });
});

describe("contact form", () => {
  it("checks the fields before sending", async () => {
    const { api, screen } = await renderContact();
    const form = screen.getByRole("form", { name: "Kontaktformular" });

    await form.getByLabelText("E-Mail").fill("anna");
    await form.getByRole("button", { name: "Nachricht senden" }).click();

    await expect.element(form.getByText("Bitte gib deinen Namen an.")).toBeVisible();
    await expect.element(form.getByText("Bitte gib eine gültige E-Mail-Adresse an.")).toBeVisible();
    await expect.element(form.getByText("Bitte schreib uns eine Nachricht.")).toBeVisible();
    await expect.element(form.getByLabelText("Name")).toHaveFocus();
    expect(api.callsTo("POST", "/api/contact")).toHaveLength(0);
  });

  it("sends the message trimmed and says thanks", async () => {
    const { api, screen } = await renderContact({
      "POST /api/contact": { json: { status: "success", message: "Nachricht erfolgreich gesendet." } },
    });
    const form = screen.getByRole("form", { name: "Kontaktformular" });

    await form.getByLabelText("Name").fill(" Anna ");
    await form.getByLabelText("E-Mail").fill("anna@example.de");
    await form.getByLabelText("Nachricht").fill("Habt ihr glutenfreie Brötchen?");
    await form.getByRole("button", { name: "Nachricht senden" }).click();

    await expect.element(screen.getByRole("heading", { name: "Nachricht erfolgreich gesendet!" })).toHaveFocus();
    expect(api.callsTo("POST", "/api/contact")[0].body).toEqual({
      name: "Anna",
      email: "anna@example.de",
      message: "Habt ihr glutenfreie Brötchen?",
    });

    await screen.getByRole("button", { name: "Neue Nachricht" }).click();
    await expect.element(screen.getByRole("form", { name: "Kontaktformular" }).getByLabelText("Name")).toHaveValue("");
  });

  it("keeps the text and explains a failure", async () => {
    const { screen } = await renderContact({ "POST /api/contact": new TypeError("Failed to fetch") });
    const form = screen.getByRole("form", { name: "Kontaktformular" });

    await form.getByLabelText("Name").fill("Anna");
    await form.getByLabelText("E-Mail").fill("anna@example.de");
    await form.getByLabelText("Nachricht").fill("Hallo");
    await form.getByRole("button", { name: "Nachricht senden" }).click();

    await expect.element(form.getByRole("alert")).toMatchTextContent(/Nachricht konnte nicht gesendet werden/);
    await expect.element(form.getByLabelText("Nachricht")).toHaveValue("Hallo");
  });
});
