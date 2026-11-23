const nodemailer = require("nodemailer");

const RECIPIENT = "burgerpubmunchen@gmail.com";
const TIME_ZONE = "Europe/Berlin";
const MAX_GUESTS = 20;

const LIMITS = { name: 100, email: 200, phone: 40, message: 2000 };

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nowInMunich() {
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
      .formatToParts(new Date())
      .map((part) => [part.type, part.value]),
  );

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) return null;
  if (date.toISOString().slice(0, 10) !== value) return null;

  return date;
}

function formatDateGerman(date) {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function fail(res, message) {
  return res.status(400).json({ status: "fail", message });
}

exports.createReservation = async (req, res) => {
  try {
    const body = req.body || {};

    const name = String(body.name ?? "").trim().replace(/\s+/g, " ");
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const dateValue = String(body.date ?? "").trim();
    const time = String(body.time ?? "").trim();
    const message = String(body.message ?? "").trim();
    const guests = Number(body.guests);

    const guestsMissing = body.guests === undefined || body.guests === null || body.guests === "";

    if (!name || !email || !phone || !dateValue || !time || guestsMissing) {
      return fail(res, "Bitte fülle alle Pflichtfelder aus.");
    }

    if (
      name.length > LIMITS.name ||
      email.length > LIMITS.email ||
      phone.length > LIMITS.phone ||
      message.length > LIMITS.message
    ) {
      return fail(res, "Eine deiner Angaben ist zu lang.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail(res, "Bitte gib eine gültige E-Mail-Adresse an.");
    }

    if (!/^[0-9+()/\-\s]{6,}$/.test(phone)) {
      return fail(res, "Bitte gib eine gültige Telefonnummer an.");
    }

    if (!Number.isInteger(guests) || guests < 1 || guests > MAX_GUESTS) {
      return fail(
        res,
        `Online kannst du für 1 bis ${MAX_GUESTS} Personen reservieren. Für größere Gruppen ruf uns bitte an.`,
      );
    }

    const date = parseDate(dateValue);

    if (!date) {
      return fail(res, "Bitte wähle ein gültiges Datum.");
    }

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      return fail(res, "Bitte wähle eine gültige Uhrzeit.");
    }

    const now = nowInMunich();

    if (dateValue < now.date) {
      return fail(res, "Das Datum liegt in der Vergangenheit.");
    }

    if (dateValue === now.date && time <= now.time) {
      return fail(res, "Die Uhrzeit liegt in der Vergangenheit.");
    }

    const dateGerman = formatDateGerman(date);
    const people = guests === 1 ? "1 Person" : `${guests} Personen`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Burger Pub Website" <${process.env.EMAIL_USER}>`,
      to: RECIPIENT,
      replyTo: email,
      subject: `Reservierungsanfrage: ${dateGerman}, ${time} Uhr, ${people} – ${name}`,

      html: `
        <h2>Neue Reservierungsanfrage über die Burger Pub Website</h2>

        <p><strong>Datum:</strong> ${escapeHtml(dateGerman)}</p>
        <p><strong>Uhrzeit:</strong> ${escapeHtml(time)} Uhr</p>
        <p><strong>Personen:</strong> ${escapeHtml(people)}</p>

        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>E-Mail:</strong> ${escapeHtml(email)}</p>
        <p><strong>Telefon:</strong> ${escapeHtml(phone)}</p>

        ${
          message
            ? `<p><strong>Nachricht:</strong></p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`
            : ""
        }

        <p><em>Die Anfrage ist noch nicht bestätigt. Antworte auf diese E-Mail oder ruf den Gast an, um sie zu bestätigen.</em></p>
      `,

      text: [
        "Neue Reservierungsanfrage über die Burger Pub Website",
        "",
        `Datum: ${dateGerman}`,
        `Uhrzeit: ${time} Uhr`,
        `Personen: ${people}`,
        "",
        `Name: ${name}`,
        `E-Mail: ${email}`,
        `Telefon: ${phone}`,
        ...(message ? ["", "Nachricht:", message] : []),
        "",
        "Die Anfrage ist noch nicht bestätigt. Antworte auf diese E-Mail oder ruf den Gast an, um sie zu bestätigen.",
      ].join("\n"),
    });

    res.status(200).json({
      status: "success",
      message: "Reservierungsanfrage erfolgreich gesendet.",
    });
  } catch (err) {
    console.error("RESERVATION ERROR:", err);

    res.status(500).json({
      status: "error",
      message: "Reservierungsanfrage konnte nicht gesendet werden.",
    });
  }
};
