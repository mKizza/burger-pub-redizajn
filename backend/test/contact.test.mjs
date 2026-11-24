import { beforeEach, describe, expect, it } from "vitest";
import { app, mail, request } from "./helpers.mjs";

const valid = (overrides = {}) => ({
  name: "Max Mustermann",
  email: "max@example.de",
  message: "Habt ihr am Sonntag offen?",
  ...overrides,
});

const send = (body) => request(app).post("/api/contact").send(body);

beforeEach(() => {
  mail.clear();
  mail.setFail(false);
});

describe("POST /api/contact", () => {
  it.each(["name", "email", "message"])(
    "answers 400 without %s",
    async (field) => {
      const body = valid();
      delete body[field];

      const res = await send(body);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        status: "fail",
        message: "Bitte füllen Sie alle Felder aus.",
      });
      expect(mail.mails).toHaveLength(0);
    },
  );

  it("answers 400 for an empty field", async () => {
    const res = await send(valid({ message: "" }));

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Bitte füllen Sie alle Felder aus.");
  });

  it("answers 500 for an empty body (current behaviour)", async () => {
    const res = await request(app).post("/api/contact");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      status: "error",
      message: "Nachricht konnte nicht gesendet werden.",
    });
  });

  it("doesn't validate the email address beyond its presence", async () => {
    const res = await send(valid({ email: "not-an-email" }));

    expect(res.status).toBe(200);
    expect(mail.mails[0].replyTo).toBe("not-an-email");
  });

  it("answers 200 and mails the message to the pub", async () => {
    const res = await send(valid());

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "success",
      message: "Nachricht erfolgreich gesendet.",
    });
    expect(mail.mails).toHaveLength(1);

    const [sent] = mail.mails;

    expect(sent.to).toBe("burgerpubmunchen@gmail.com");
    expect(sent.from).toBe('"Burger Pub Website" <website@burgerpub.test>');
    expect(sent.replyTo).toBe("max@example.de");
    expect(sent.subject).toBe("Neue Nachricht von Max Mustermann");
    expect(sent.html).toContain("<p><strong>Name:</strong> Max Mustermann</p>");
    expect(sent.html).toContain("<p>Habt ihr am Sonntag offen?</p>");
    expect(sent.text).toBeNull();
  });

  it("puts the visitor's input into the HTML unescaped (current behaviour)", async () => {
    await send(valid({ message: "<b>fett</b>" }));

    expect(mail.mails[0].html).toContain("<p><b>fett</b></p>");
  });

  it("answers 500 when sending fails", async () => {
    mail.setFail(true);

    const res = await send(valid());

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      status: "error",
      message: "Nachricht konnte nicht gesendet werden.",
    });
    expect(mail.mails).toHaveLength(0);
  });
});
