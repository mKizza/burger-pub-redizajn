import { useState } from "react";

import { API_URL } from "./config";

const MAX_GUESTS = 20;
const GUEST_OPTIONS = Array.from({ length: MAX_GUESTS }, (_, i) => i + 1);

const inputClass =
  "w-full border border-[#ffaf01] bg-black/30 px-4! py-3! font-oswald text-[14px] text-white outline-none [color-scheme:dark] placeholder:text-white/40 focus:border-white";

const labelClass = "font-oswald text-[13px] font-bold uppercase text-[#ffaf01]";

function todayInMunich() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(
    new Date(),
  );
}

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  date: "",
  time: "",
  guests: "2",
  message: "",
};

function ReservationForm() {
  const [form, setForm] = useState(emptyForm);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setIsSending(true);
    setStatus("");
    setErrorMessage("");

    try {
      const res = await fetch(`${API_URL}/api/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          guests: Number(form.guests),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(res.status === 400 ? data.message : "");
        throw new Error(data.message || "Fehler beim Senden.");
      }

      setStatus("success");
      setForm(emptyForm);
    } catch (err) {
      console.error("RESERVATION ERROR:", err);
      setStatus("error");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section id="reservieren" className="w-full scroll-mt-24 px-5!">
      <div className="flex items-center gap-3">
        <h2 className="shrink-0 font-anton text-[36px] uppercase text-[#ffffff]">
          Tisch
        </h2>

        <h2 className="shrink-0 font-anton text-[36px] uppercase text-[#ffaf01]">
          reservieren.
        </h2>

        <div className="h-[1px] flex-1 bg-[#ffaf01]" />
      </div>

      <p className="mt-2! font-oswald text-[13px] text-white/70">
        Schick uns deine Reservierungsanfrage – wir bestätigen sie dir per
        E-Mail oder Telefon. Für Gruppen über {MAX_GUESTS} Personen ruf uns
        bitte an:{" "}
        <a href="tel:+498932795957" className="text-[#ffaf01] underline">
          +49 89 32795957
        </a>
        .
      </p>

      <form onSubmit={handleSubmit} className="mt-8! flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label htmlFor="reservation-date" className={labelClass}>
              Datum
            </label>

            <input
              id="reservation-date"
              name="date"
              type="date"
              required
              min={todayInMunich()}
              value={form.date}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="reservation-time" className={labelClass}>
              Uhrzeit
            </label>

            <input
              id="reservation-time"
              name="time"
              type="time"
              required
              value={form.time}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="col-span-2 flex flex-col gap-2 md:col-span-1">
            <label htmlFor="reservation-guests" className={labelClass}>
              Personen
            </label>

            <select
              id="reservation-guests"
              name="guests"
              required
              value={form.guests}
              onChange={handleChange}
              className={inputClass}
            >
              {GUEST_OPTIONS.map((count) => (
                <option key={count} value={count} className="bg-black">
                  {count === 1 ? "1 Person" : `${count} Personen`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="reservation-name" className={labelClass}>
            Name
          </label>

          <input
            id="reservation-name"
            name="name"
            type="text"
            required
            maxLength={100}
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Dein Name"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="reservation-email" className={labelClass}>
              E-Mail
            </label>

            <input
              id="reservation-email"
              name="email"
              type="email"
              required
              maxLength={200}
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="deine@email.de"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="reservation-phone" className={labelClass}>
              Telefon
            </label>

            <input
              id="reservation-phone"
              name="phone"
              type="tel"
              required
              maxLength={40}
              autoComplete="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+49 …"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="reservation-message" className={labelClass}>
            Nachricht (optional)
          </label>

          <textarea
            id="reservation-message"
            name="message"
            rows="3"
            maxLength={2000}
            value={form.message}
            onChange={handleChange}
            placeholder="Anlass, Wünsche, Kinderstuhl …"
            className={`${inputClass} resize-none`}
          />
        </div>

        {status === "success" && (
          <p className="text-center font-oswald text-sm text-green-500">
            Danke! Deine Anfrage ist bei uns angekommen. Wir bestätigen deinen
            Tisch per E-Mail oder Telefon.
          </p>
        )}

        {status === "error" && (
          <p className="text-center font-oswald text-sm text-red-500">
            {errorMessage ||
              "Anfrage konnte nicht gesendet werden. Bitte ruf uns an: +49 89 32795957."}
          </p>
        )}

        <button
          type="submit"
          disabled={isSending}
          className="mt-4! flex w-full items-center justify-center border-2 border-[#ffaf01] bg-[#ffaf01] py-3! font-oswald text-[14px] font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-[#ffaf01] disabled:cursor-not-allowed disabled:opacity-50 md:w-[300px] md:self-center lg:w-[320px]"
        >
          {isSending ? "Wird gesendet..." : "Reservierung anfragen"}
        </button>
      </form>
    </section>
  );
}

export default ReservationForm;
