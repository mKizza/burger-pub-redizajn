import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../../lib/api";
import { PUB } from "../../lib/pub";
import { validateContact } from "../../lib/reservation";
import { Button } from "../ui/Button";
import { TextField } from "../ui/Field";
import Icon from "../ui/Icon";
import { keepFocusOnButtonPress } from "../ui/keepFocus";

const FIELD_ORDER = ["name", "email", "message"];
const EMPTY = { name: "", email: "", message: "" };

function fieldId(name) {
  return `contact-${name}`;
}

function SentPanel({ onReset }) {
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col items-center gap-5 py-8 text-center" role="status">
      <span className="grid size-16 place-items-center rounded-full border-2 border-brand text-brand">
        <Icon name="check" className="size-8" />
      </span>
      <h3 ref={headingRef} tabIndex={-1} className="font-anton text-3xl tracking-wide text-white focus:outline-none">
        Nachricht erfolgreich gesendet!
      </h3>
      <Button variant="outline" onClick={onReset}>
        Neue Nachricht
      </Button>
    </div>
  );
}

function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("idle");
  const formRef = useRef(null);

  const errors = validateContact(values);
  const visibleError = (name) => (submitted || touched[name] ? errors[name] : undefined);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
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

    try {
      await apiFetch("/api/contact", {
        method: "POST",
        body: {
          name: values.name.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
        },
      });

      setStatus("success");
      setValues(EMPTY);
      setTouched({});
      setSubmitted(false);
    } catch (err) {
      console.error("CONTACT ERROR:", err);
      setStatus("error");
    }
  }

  if (status === "success") {
    return <SentPanel onReset={() => setStatus("idle")} />;
  }

  const sending = status === "sending";

  return (
    <form ref={formRef} onSubmit={handleSubmit} onMouseDown={keepFocusOnButtonPress} noValidate aria-label="Kontaktformular" className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id={fieldId("name")}
          name="name"
          label="Name"
          required
          autoComplete="name"
          placeholder="Dein Name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError("name")}
        />
        <TextField
          id={fieldId("email")}
          name="email"
          type="email"
          label="E-Mail"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="deine@email.de"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError("email")}
        />
      </div>

      <TextField
        id={fieldId("message")}
        name="message"
        label="Nachricht"
        required
        multiline
        rows={5}
        placeholder="Deine Nachricht …"
        value={values.message}
        onChange={handleChange}
        onBlur={handleBlur}
        error={visibleError("message")}
      />

      {status === "error" && (
        <div role="alert" className="flex items-start gap-3 border border-red-400/40 bg-red-500/10 p-4 font-montserrat text-sm leading-relaxed text-red-100">
          <Icon name="alert" className="mt-0.5 size-5 shrink-0 text-red-300" />
          <p>
            Nachricht konnte nicht gesendet werden. Ruf uns gerne an:{" "}
            <a href={PUB.phoneHref} className="whitespace-nowrap font-semibold text-white underline underline-offset-4">
              {PUB.phone}
            </a>
          </p>
        </div>
      )}

      <Button type="submit" variant="outline" size="lg" disabled={sending} className="w-full sm:w-auto sm:self-start">
        {sending ? (
          <>
            <Icon name="spinner" className="size-5" /> Wird gesendet …
          </>
        ) : (
          <>
            Nachricht senden <Icon name="arrowRight" className="size-5" />
          </>
        )}
      </Button>
    </form>
  );
}

export default ContactForm;
