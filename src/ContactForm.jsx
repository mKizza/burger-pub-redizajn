function ContactForm() {
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
      <form className="mt-8 flex flex-col gap-5">
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

        {/* BUTTON */}
        <button
          type="submit"
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
          md:w-[300px]
          md:self-center
          lg:w-[320px]k
          "
        >
          Nachricht senden
        </button>
      </form>
    </section>
  );
}

export default ContactForm;
