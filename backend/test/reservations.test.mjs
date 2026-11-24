import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { app, mail, request } from "./helpers.mjs";

// utorak, 24. 11. 2026., 18:30 u Münchenu (CET, UTC+1)
const NOW = new Date("2026-11-24T18:30:00+01:00");

const MESSAGES = {
  missing: "Bitte fülle alle Pflichtfelder aus.",
  tooLong: "Eine deiner Angaben ist zu lang.",
  email: "Bitte gib eine gültige E-Mail-Adresse an.",
  phone: "Bitte gib eine gültige Telefonnummer an.",
  guests:
    "Online kannst du für 1 bis 20 Personen reservieren. Für größere Gruppen ruf uns bitte an.",
  date: "Bitte wähle ein gültiges Datum.",
  time: "Bitte wähle eine gültige Uhrzeit.",
  pastDate: "Das Datum liegt in der Vergangenheit.",
  pastTime: "Die Uhrzeit liegt in der Vergangenheit.",
};

const valid = (overrides = {}) => ({
  name: "Anna Muster",
  email: "anna@example.de",
  phone: "+49 (0)89 / 123-456",
  date: "2026-12-24",
  time: "19:30",
  guests: 4,
  message: "",
  ...overrides,
});

const reserve = (body) => request(app).post("/api/reservations").send(body);

async function expectFail(body, message) {
  const res = await reserve(body);

  expect(res.status).toBe(400);
  expect(res.body).toEqual({ status: "fail", message });
  expect(mail.mails).toHaveLength(0);
}

beforeEach(() => {
  mail.clear();
  mail.setFail(false);
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("POST /api/reservations: validation", () => {
  it.each(["name", "email", "phone", "date", "time", "guests"])(
    "answers 400 without %s",
    async (field) => {
      const body = valid();
      delete body[field];

      await expectFail(body, MESSAGES.missing);
    },
  );

  it("answers 400 for an empty body", async () => {
    const res = await request(app).post("/api/reservations");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(MESSAGES.missing);
  });

  it.each([
    ["a name of only spaces", { name: "   " }],
    ["guests as an empty string", { guests: "" }],
    ["guests as null", { guests: null }],
  ])("treats %s as missing", async (_, overrides) => {
    await expectFail(valid(overrides), MESSAGES.missing);
  });

  it.each([
    ["name", { name: "A".repeat(101) }],
    ["email", { email: `${"a".repeat(190)}@example.de` }],
    ["phone", { phone: "1".repeat(41) }],
    ["message", { message: "x".repeat(2001) }],
  ])("answers 400 when the %s is too long", async (_, overrides) => {
    await expectFail(valid(overrides), MESSAGES.tooLong);
  });

  it("accepts every field at its maximum length", async () => {
    const res = await reserve(
      valid({
        name: "A".repeat(100),
        email: `${"a".repeat(189)}@example.de`,
        phone: "1".repeat(40),
        message: "x".repeat(2000),
      }),
    );

    expect(res.status).toBe(200);
  });

  it.each([
    "anna@example",
    "anna.example.de",
    "anna @example.de",
    "anna@@example.de",
  ])("answers 400 for the email %j", async (email) => {
    await expectFail(valid({ email }), MESSAGES.email);
  });

  it.each(["12345", "089-CALL-ME", "Tel. 089 123456"])(
    "answers 400 for the phone %j",
    async (phone) => {
      await expectFail(valid({ phone }), MESSAGES.phone);
    },
  );

  it.each([0, 21, -1, 2.5, "abc", "4 Personen"])(
    "answers 400 for guests: %j",
    async (guests) => {
      await expectFail(valid({ guests }), MESSAGES.guests);
    },
  );

  it.each([1, 20, "4"])("accepts guests: %j", async (guests) => {
    const res = await reserve(valid({ guests }));

    expect(res.status).toBe(200);
  });

  it.each(["2026-02-30", "2026-13-01", "24.12.2026", "2026-1-5"])(
    "answers 400 for the date %j",
    async (date) => {
      await expectFail(valid({ date }), MESSAGES.date);
    },
  );

  it.each(["25:00", "24:00", "19:60", "7:30", "19.30"])(
    "answers 400 for the time %j",
    async (time) => {
      await expectFail(valid({ time }), MESSAGES.time);
    },
  );

  it("answers 400 for yesterday", async () => {
    await expectFail(valid({ date: "2026-11-23" }), MESSAGES.pastDate);
  });

  it.each(["18:29", "18:30"])(
    "answers 400 for today at %s (now is 18:30)",
    async (time) => {
      await expectFail(valid({ date: "2026-11-24", time }), MESSAGES.pastTime);
    },
  );

  it("accepts today a minute from now", async () => {
    const res = await reserve(valid({ date: "2026-11-24", time: "18:31" }));

    expect(res.status).toBe(200);
  });
});

describe("POST /api/reservations: Munich's time zone", () => {
  it("uses Munich's date after midnight there, while it's still yesterday in UTC", async () => {
    vi.setSystemTime(new Date("2026-11-24T23:30:00Z"));

    await expectFail(
      valid({ date: "2026-11-24", time: "23:45" }),
      MESSAGES.pastDate,
    );
    await expectFail(
      valid({ date: "2026-11-25", time: "00:15" }),
      MESSAGES.pastTime,
    );

    const res = await reserve(valid({ date: "2026-11-25", time: "00:45" }));

    expect(res.status).toBe(200);
  });

  it("follows summer time (UTC+2)", async () => {
    vi.setSystemTime(new Date("2026-07-01T22:30:00Z"));

    await expectFail(
      valid({ date: "2026-07-01", time: "23:59" }),
      MESSAGES.pastDate,
    );

    const res = await reserve(valid({ date: "2026-07-02", time: "00:31" }));

    expect(res.status).toBe(200);
  });
});

describe("POST /api/reservations: sending", () => {
  it("answers 200 and mails the request to the pub", async () => {
    const res = await reserve(valid({ name: "  Anna   Muster ", guests: 4 }));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "success",
      message: "Reservierungsanfrage erfolgreich gesendet.",
    });
    expect(mail.mails).toHaveLength(1);

    const [sent] = mail.mails;

    expect(sent.to).toBe("burgerpubmunchen@gmail.com");
    expect(sent.from).toBe('"Burger Pub Website" <website@burgerpub.test>');
    expect(sent.replyTo).toBe("anna@example.de");
    expect(sent.subject).toBe(
      "Reservierungsanfrage: Do., 24.12.2026, 19:30 Uhr, 4 Personen – Anna Muster",
    );
    expect(sent.html).toContain(
      "<p><strong>Datum:</strong> Do., 24.12.2026</p>",
    );
    expect(sent.html).toContain("<p><strong>Personen:</strong> 4 Personen</p>");
    expect(sent.html).toContain(
      "<p><strong>Telefon:</strong> +49 (0)89 / 123-456</p>",
    );
    expect(sent.html).not.toContain("Nachricht:");
    expect(sent.text).toContain("Datum: Do., 24.12.2026");
    expect(sent.text).toContain("Name: Anna Muster");
    expect(sent.text).not.toContain("Nachricht:");
    expect(sent.text).toContain("Die Anfrage ist noch nicht bestätigt.");
  });

  it("writes one guest as 1 Person", async () => {
    await reserve(valid({ guests: 1 }));

    expect(mail.mails[0].subject).toContain(", 1 Person – ");
  });

  it("HTML-escapes the guest's input in the mail's HTML", async () => {
    const res = await reserve(
      valid({
        name: `<b>Anna</b> & "Co" 'x'`,
        message: "<script>alert(1)</script>\nZweite Zeile",
      }),
    );

    expect(res.status).toBe(200);

    const [sent] = mail.mails;

    expect(sent.html).toContain(
      "<p><strong>Name:</strong> &lt;b&gt;Anna&lt;/b&gt; &amp; &quot;Co&quot; &#39;x&#39;</p>",
    );
    expect(sent.html).toContain(
      "<p>&lt;script&gt;alert(1)&lt;/script&gt;<br>Zweite Zeile</p>",
    );
    expect(sent.html).not.toContain("<script>");
    expect(sent.html).not.toContain("<b>Anna");
    expect(sent.text).toContain(
      "Nachricht:\n<script>alert(1)</script>\nZweite Zeile",
    );
    expect(sent.subject).toContain(`– <b>Anna</b> & "Co" 'x'`);
  });

  it("answers 500 when sending fails", async () => {
    mail.setFail(true);

    const res = await reserve(valid());

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      status: "error",
      message: "Reservierungsanfrage konnte nicht gesendet werden.",
    });
    expect(mail.mails).toHaveLength(0);
  });
});
