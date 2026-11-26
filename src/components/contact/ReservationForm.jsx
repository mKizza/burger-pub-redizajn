import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../../lib/api";
import { PUB } from "../../lib/pub";
import {
  addDays,
  formatDateGerman,
  guestsLabel,
  LIMITS,
  MAX_GUESTS,
  nowInMunich,
  validateReservation,
} from "../../lib/reservation";
import { Button } from "../ui/Button";
import { FieldError, FieldLabel, TextField } from "../ui/Field";
import { controlClass, fieldDescribedBy } from "../ui/fieldStyles";
import { keepFocusOnButtonPress } from "../ui/keepFocus";
import Icon from "../ui/Icon";

const FIELD_ORDER = ["date", "time", "guests", "name", "email", "phone", "message"];

const EMPTY = {
  date: "",
  time: "",
  guests: 2,
  name: "",
  email: "",
  phone: "",
  message: "",
};

function fieldId(name) {
  return `reservation-${name}`;
}

function SuccessPanel({ request, onReset }) {
  const headingRef = useRef(null);
  const firstName = request.name.trim().split(" ")[0];

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <span className="grid size-16 place-items-center rounded-full border-2 border-brand text-brand">
        <Icon name="check" className="size-8" />
      </span>

      <div className="flex flex-col gap-3" role="status">
        <h3
          ref={headingRef}
          tabIndex={-1}
          className="font-anton text-4xl tracking-wide text-white focus:outline-none"
        >
          Danke, <span className="text-brand">{firstName}!</span>
        </h3>
        <p className="mx-auto max-w-md font-montserrat text-[15px] leading-relaxed text-white/75">
          Deine Anfrage ist bei uns angekommen. Wir bestätigen deinen Tisch per
          E-Mail oder Telefon.
        </p>
      </div>

      <dl className="grid w-full max-w-md grid-cols-3 border border-white/10 bg-black/40 text-left">
        {[
          ["Datum", formatDateGerman(request.date)],
          ["Uhrzeit", `${request.time} Uhr`],
          ["Personen", guestsLabel(request.guests)],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1 border-r border-white/10 p-4 last:border-0">
            <dt className="font-oswald text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
              {label}
            </dt>
            <dd className="font-oswald text-[15px] leading-snug text-white">{value}</dd>
          </div>
        ))}
      </dl>

      <Button variant="outline" onClick={onReset}>
        Neue Anfrage
      </Button>
    </div>
  );
}

function ReservationForm() {
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [sentRequest, setSentRequest] = useState(null);
  const formRef = useRef(null);

  const today = nowInMunich().date;
  const tomorrow = addDays(today, 1);
  const errors = validateReservation(values);
  const visibleError = (name) => (submitted || touched[name] ? errors[name] : undefined);
  const guests = Number(values.guests);

  function update(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleChange(event) {
    update(event.target.name, event.target.value);
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
  }

  function setGuests(next) {
    update("guests", Math.min(MAX_GUESTS, Math.max(1, next)));
    setTouched((prev) => ({ ...prev, guests: true }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);

    const firstInvalid = FIELD_ORDER.find((name) => errors[name]);

    if (firstInvalid) {
      formRef.current?.querySelector(`#${fieldId(firstInvalid)}`)?.focus();
      return;
    }

    setStatus("sending");
    setServerMessage("");

    try {
      await apiFetch("/api/reservations", {
        method: "POST",
        body: { ...values, guests },
      });

      setSentRequest({ ...values, guests });
      setStatus("success");
      setValues(EMPTY);
      setTouched({});
      setSubmitted(false);
    } catch (err) {
      console.error("RESERVATION ERROR:", err);
      setServerMessage(err.status === 400 ? err.serverMessage : "");
      setStatus("error");
    }
  }

  if (status === "success" && sentRequest) {
    return (
      <SuccessPanel
        request={sentRequest}
        onReset={() => {
          setSentRequest(null);
          setStatus("idle");
        }}
      />
    );
  }

  const sending = status === "sending";

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onMouseDown={keepFocusOnButtonPress}
      noValidate
      aria-label="Reservierungsanfrage"
      className="flex flex-col gap-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor={fieldId("date")}>Datum</FieldLabel>
          <input
            id={fieldId("date")}
            name="date"
            type="date"
            required
            min={today}
            value={values.date}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={visibleError("date") ? true : undefined}
            aria-describedby={fieldDescribedBy(fieldId("date"), { error: visibleError("date") })}
            className={controlClass(visibleError("date"), "h-12 px-4")}
          />
          <div className="flex gap-2" role="group" aria-label="Schnellauswahl Datum">
            {[
              ["Heute", today],
              ["Morgen", tomorrow],
            ].map(([label, date]) => (
              <button
                key={label}
                type="button"
                aria-pressed={values.date === date}
                onClick={() => {
                  update("date", date);
                  setTouched((prev) => ({ ...prev, date: true }));
                }}
                className={`h-8 border px-3 font-oswald text-xs font-semibold uppercase tracking-[0.12em] transition ${
                  values.date === date
                    ? "border-brand bg-brand text-black"
                    : "border-white/15 text-white/70 hover:border-brand hover:text-brand"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <FieldError id={`${fieldId("date")}-error`}>{visibleError("date")}</FieldError>
        </div>

        <TextField
          id={fieldId("time")}
          name="time"
          type="time"
          label="Uhrzeit"
          required
          value={values.time}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError("time")}
        />
      </div>

      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor={fieldId("guests")}>Personen</FieldLabel>
        <div
          className={`flex h-12 items-stretch ${controlClass(visibleError("guests"))} focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/25`}
        >
          <button
            type="button"
            onClick={() => setGuests(guests - 1)}
            disabled={guests <= 1}
            className="grid w-14 shrink-0 place-items-center border-r border-white/10 text-brand transition hover:bg-brand hover:text-black disabled:text-white/25 disabled:hover:bg-transparent"
          >
            <Icon name="minus" />
            <span className="sr-only">Eine Person weniger</span>
          </button>
          <input
            id={fieldId("guests")}
            name="guests"
            type="number"
            inputMode="numeric"
            required
            min="1"
            max={MAX_GUESTS}
            value={values.guests}
            onChange={(event) =>
              update("guests", event.target.value === "" ? "" : Number(event.target.value))
            }
            onBlur={handleBlur}
            aria-invalid={visibleError("guests") ? true : undefined}
            aria-describedby={`${fieldId("guests")}-hint${visibleError("guests") ? ` ${fieldId("guests")}-error` : ""}`}
            className="w-full min-w-0 bg-transparent text-center font-oswald text-lg text-white [appearance:textfield] focus:outline-none focus-visible:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => setGuests(guests + 1)}
            disabled={guests >= MAX_GUESTS}
            className="grid w-14 shrink-0 place-items-center border-l border-white/10 text-brand transition hover:bg-brand hover:text-black disabled:text-white/25 disabled:hover:bg-transparent"
          >
            <Icon name="plus" />
            <span className="sr-only">Eine Person mehr</span>
          </button>
        </div>
        <p id={`${fieldId("guests")}-hint`} className="font-montserrat text-xs text-white/50">
          Mehr als {MAX_GUESTS} Personen? Ruf uns an:{" "}
          <a href={PUB.phoneHref} className="text-brand underline underline-offset-4">
            {PUB.phone}
          </a>
        </p>
        <FieldError id={`${fieldId("guests")}-error`}>{visibleError("guests")}</FieldError>
      </div>

      <TextField
        id={fieldId("name")}
        name="name"
        label="Name"
        required
        maxLength={LIMITS.name}
        autoComplete="name"
        placeholder="Dein Name"
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
        error={visibleError("name")}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id={fieldId("email")}
          name="email"
          type="email"
          label="E-Mail"
          required
          maxLength={LIMITS.email}
          autoComplete="email"
          inputMode="email"
          placeholder="deine@email.de"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError("email")}
        />
        <TextField
          id={fieldId("phone")}
          name="phone"
          type="tel"
          label="Telefon"
          required
          maxLength={LIMITS.phone}
          autoComplete="tel"
          placeholder="+49 …"
          value={values.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError("phone")}
        />
      </div>

      <TextField
        id={fieldId("message")}
        name="message"
        label="Nachricht"
        optional
        multiline
        rows={3}
        maxLength={LIMITS.message}
        placeholder="Anlass, Wünsche, Kinderstuhl …"
        value={values.message}
        onChange={handleChange}
        onBlur={handleBlur}
        error={visibleError("message")}
      />

      {status === "error" && (
        <div role="alert" className="flex items-start gap-3 border border-red-400/40 bg-red-500/10 p-4 font-montserrat text-sm leading-relaxed text-red-100">
          <Icon name="alert" className="mt-0.5 size-5 shrink-0 text-red-300" />
          <p>
            {serverMessage || (
              <>
                Anfrage konnte nicht gesendet werden. Bitte ruf uns an:{" "}
                <a href={PUB.phoneHref} className="whitespace-nowrap font-semibold text-white underline underline-offset-4">
                  {PUB.phone}
                </a>
                .
              </>
            )}
          </p>
        </div>
      )}

      <Button type="submit" size="lg" disabled={sending} className="w-full">
        {sending ? (
          <>
            <Icon name="spinner" className="size-5" /> Wird gesendet …
          </>
        ) : (
          <>
            Reservierung anfragen <Icon name="arrowRight" className="size-5" />
          </>
        )}
      </Button>

      <p className="text-center font-montserrat text-xs leading-relaxed text-white/45">
        Deine Anfrage ist erst nach unserer Bestätigung verbindlich.
      </p>
    </form>
  );
}

export default ReservationForm;
