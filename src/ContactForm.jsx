import { useState } from "react";

import { API_URL } from "../config";

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setIsSending(true);
    setStatus("");

    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Fehler beim Senden.");
      }

      setStatus("success");

      // Očisti formu
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error("CONTACT ERROR:", err);
      setStatus("error");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="w-full px-5 pt-14 pb-12">
      {/* NASLOV */}
      <div className="flex items-center gap-3">
        <h2 className="shrink-0 font-anton text-[36px] uppercase text-[#ffffff]">
          Schreib
        </h2>

        <h2 className="shrink-0 font-anton text-[36px] uppercase text-[#ffaf01]">
          uns.
        </h2>

        <div className="h-[1px] flex-1 bg-[#ffaf01]" />
      </div>

      <p className="mt-2 font-oswald text-[13px] text-white/70">
        Du hast Fragen oder möchtest uns etwas mitteilen? Schreib uns einfach
        eine Nachricht.
      </p>

      {/* FORMA */}
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        {/* IME */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="name"
            className="font-oswald text-[13px] font-bold uppercase text-[#ffaf01]"
          >
            Name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dein Name"
            className="
              w-full
              border
              border-[#ffaf01]
              bg-black/30
              px-4
              py-3
              font-oswald
              text-[14px]
              text-white
              outline-none
              placeholder:text-white/40
              focus:border-white
            "
          />
        </div>

        {/* EMAIL */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="font-oswald text-[13px] font-bold uppercase text-[#ffaf01]"
          >
            E-Mail
          </label>

          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="deine@email.de"
            className="
              w-full
              border
              border-[#ffaf01]
              bg-black/30
              px-4
              py-3
              font-oswald
              text-[14px]
              text-white
              outline-none
              placeholder:text-white/40
              focus:border-white
            "
          />
        </div>

        {/* PORUKA */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="message"
            className="font-oswald text-[13px] font-bold uppercase text-[#ffaf01]"
          >
            Nachricht
          </label>

          <textarea
            id="message"
            name="message"
            required
            rows="6"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Deine Nachricht..."
            className="
              w-full
              resize-none
              border
              border-[#ffaf01]
              bg-black/30
              px-4
              py-3
              font-oswald
              text-[14px]
              text-white
              outline-none
              placeholder:text-white/40
              focus:border-white
            "
          />
        </div>

        {/* SUCCESS */}
        {status === "success" && (
          <p className="text-center font-oswald text-sm text-green-500">
            Nachricht erfolgreich gesendet!
          </p>
        )}

        {/* ERROR */}
        {status === "error" && (
          <p className="text-center font-oswald text-sm text-red-500">
            Nachricht konnte nicht gesendet werden.
          </p>
        )}

        {/* BUTTON */}
        <button
          type="submit"
          disabled={isSending}
          className="
            mt-4
            flex
            w-full
            items-center
            justify-center
            border-2
            border-[#ffaf01]
            bg-transparent
            py-3
            font-oswald
            text-[14px]
            font-bold
            uppercase
            text-[#ffaf01]
            disabled:cursor-not-allowed
            disabled:opacity-50
            md:w-[300px]
            md:self-center
            lg:w-[320px]
          "
        >
          {isSending ? "Wird gesendet..." : "Nachricht senden"}
        </button>
      </form>
    </section>
  );
}

export default ContactForm;
