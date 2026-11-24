import { expect, expectNoA11yViolations, germanShortDate, munichDate, PUB_EMAIL, test } from "./support";

function reservationForm(page) {
  return page.getByRole("form", { name: "Reservierungsanfrage" });
}

async function fillReservation(form, values) {
  await form.getByLabel("Datum", { exact: true }).fill(values.date);
  await form.getByLabel("Uhrzeit").fill(values.time);
  await form.getByRole("textbox", { name: "Name" }).fill(values.name);
  await form.getByRole("textbox", { name: "E-Mail" }).fill(values.email);
  await form.getByRole("textbox", { name: "Telefon" }).fill(values.phone);
}

test.describe("table reservation", () => {
  test("sends a request that reaches the pub's inbox", async ({ page, backend }) => {
    const date = munichDate(3);
    await page.goto("/contact#reservieren");
    const form = reservationForm(page);

    await fillReservation(form, {
      date,
      time: "19:30",
      name: "Max Mustermann",
      email: "max@example.de",
      phone: "+49 176 1234567",
    });
    await form.getByRole("button", { name: "Eine Person mehr" }).click();
    await form.getByRole("textbox", { name: "Nachricht" }).fill("Geburtstag <b>mit Torte</b>");
    await form.getByRole("button", { name: "Reservierung anfragen" }).click();

    await expect(page.getByRole("heading", { name: "Danke, Max!" })).toBeVisible();
    await expect(page.getByText("3 Personen")).toBeVisible();
    await expect(page.getByText("19:30 Uhr")).toBeVisible();

    const mails = await backend.mails();
    expect(mails).toHaveLength(1);
    expect(mails[0]).toMatchObject({
      to: PUB_EMAIL,
      replyTo: "max@example.de",
      subject: `Reservierungsanfrage: ${germanShortDate(date)}, 19:30 Uhr, 3 Personen – Max Mustermann`,
    });
    expect(mails[0].html).toContain("Geburtstag &lt;b&gt;mit Torte&lt;/b&gt;");
    expect(mails[0].text).toContain("Telefon: +49 176 1234567");
  });

  test("checks the form before anything is sent", async ({ page, backend }) => {
    await page.goto("/contact");
    const form = reservationForm(page);

    await form.getByRole("button", { name: "Reservierung anfragen" }).click();

    await expect(form.getByText("Bitte wähle ein Datum.")).toBeVisible();
    await expect(form.getByText("Bitte gib deinen Namen an.")).toBeVisible();
    await expect(form.getByLabel("Datum", { exact: true })).toBeFocused();

    await form.getByRole("button", { name: "Heute" }).click();
    await form.getByLabel("Uhrzeit").fill("00:00");
    await form.getByRole("textbox", { name: "Name" }).click();
    await expect(form.getByText("Die Uhrzeit liegt in der Vergangenheit.")).toBeVisible();

    await form.getByRole("textbox", { name: "Telefon" }).fill("12");
    await form.getByRole("textbox", { name: "Name" }).click();
    await expect(form.getByText("Bitte gib eine gültige Telefonnummer an.")).toBeVisible();

    expect(await backend.mails()).toHaveLength(0);
  });

  test("shows the API's reason when it refuses a request", async ({ page }) => {
    await page.route("**/api/reservations", (route) =>
      route.fulfill({
        status: 400,
        json: { status: "fail", message: "Die Uhrzeit liegt in der Vergangenheit." },
      }),
    );
    await page.goto("/contact");
    const form = reservationForm(page);

    await fillReservation(form, {
      date: munichDate(1),
      time: "18:00",
      name: "Max",
      email: "max@example.de",
      phone: "0176 1234567",
    });
    await form.getByRole("button", { name: "Reservierung anfragen" }).click();

    await expect(form.getByRole("alert")).toHaveText("Die Uhrzeit liegt in der Vergangenheit.");
  });

  test("offers the phone when mail is down, and works again afterwards", async ({ page, backend }) => {
    await backend.failMail(true);
    await page.goto("/contact");
    const form = reservationForm(page);

    await fillReservation(form, {
      date: munichDate(2),
      time: "20:00",
      name: "Erika Musterfrau",
      email: "erika@example.de",
      phone: "089 123456",
    });
    await form.getByRole("button", { name: "Reservierung anfragen" }).click();

    await expect(form.getByRole("alert")).toContainText("Anfrage konnte nicht gesendet werden. Bitte ruf uns an:");
    await expect(form.getByRole("alert").getByRole("link", { name: "+49 89 32795957" })).toBeVisible();

    await backend.failMail(false);
    await form.getByRole("button", { name: "Reservierung anfragen" }).click();
    await expect(page.getByRole("heading", { name: "Danke, Erika!" })).toBeVisible();
    expect(await backend.mails()).toHaveLength(1);
  });
});

test.describe("contact form", () => {
  test("sends a message to the pub", async ({ page, backend }) => {
    await page.goto("/contact");
    const form = page.getByRole("form", { name: "Kontaktformular" });

    await form.getByRole("textbox", { name: "Name" }).fill("Anna");
    await form.getByRole("textbox", { name: "E-Mail" }).fill("anna@example.de");
    await form.getByRole("textbox", { name: "Nachricht" }).fill("Habt ihr glutenfreie Brötchen?");
    await form.getByRole("button", { name: "Nachricht senden" }).click();

    await expect(page.getByRole("heading", { name: "Nachricht erfolgreich gesendet!" })).toBeVisible();

    const [mail] = await backend.mails();
    expect(mail).toMatchObject({ to: PUB_EMAIL, replyTo: "anna@example.de", subject: "Neue Nachricht von Anna" });
    expect(mail.html).toContain("Habt ihr glutenfreie Brötchen?");
  });

  test("keeps the message when sending fails", async ({ page, backend }) => {
    await backend.failMail(true);
    await page.goto("/contact");
    const form = page.getByRole("form", { name: "Kontaktformular" });

    await form.getByRole("textbox", { name: "Name" }).fill("Anna");
    await form.getByRole("textbox", { name: "E-Mail" }).fill("anna@example.de");
    await form.getByRole("textbox", { name: "Nachricht" }).fill("Hallo");
    await form.getByRole("button", { name: "Nachricht senden" }).click();

    await expect(form.getByRole("alert")).toContainText("Nachricht konnte nicht gesendet werden.");
    await expect(form.getByRole("textbox", { name: "Nachricht" })).toHaveValue("Hallo");
  });
});

test.describe("contact page", () => {
  test("loads Google Maps only after a click", async ({ page }) => {
    const googleRequests = [];
    await page.route("https://www.google.com/**", (route) => {
      googleRequests.push(route.request().url());
      return route.fulfill({ contentType: "text/html", body: "<html><body>Karte</body></html>" });
    });

    await page.goto("/contact");
    await expect(page.getByRole("button", { name: "Karte laden" })).toBeVisible();
    expect(googleRequests).toEqual([]);

    await page.getByRole("button", { name: "Karte laden" }).click();
    await expect(page.locator("iframe[title^='Karte']")).toBeVisible();
    await expect.poll(() => googleRequests.length).toBeGreaterThan(0);
  });

  test("makes no request to Google Fonts", async ({ page }) => {
    const external = [];
    page.on("request", (request) => {
      if (/fonts\.(googleapis|gstatic)\.com/.test(request.url())) external.push(request.url());
    });

    await page.goto("/contact");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("KONTAKT");
    await page.evaluate(() => document.fonts.ready);

    expect(external).toEqual([]);
    expect(await page.evaluate(() => document.fonts.check("16px Anton"))).toBe(true);
  });

  test("has no serious accessibility problems", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("KONTAKT");

    await expectNoA11yViolations(page);
  });
});
