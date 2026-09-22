function ContactMap() {
  return (
    <section className="mt-12 flex w-full flex-col gap-5 px-5">
      <div className="w-full overflow-hidden rounded-[10px] border border-[#ffaf01]">
        <iframe
          title="Burger Pub München"
          src="https://www.google.com/maps?q=Milbertshofener+Str.+34,+80807+München,+Germany&output=embed"
          width="100%"
          height="300"
          className="grayscale-[30%] invert-[90%] hue-rotate-[180deg] brightness-[85%] contrast-[90%]"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <a
        href="https://www.google.com/maps/dir/?api=1&destination=Milbertshofener+Str.+34,+80807+München,+Germany"
        target="_blank"
        rel="noopener noreferrer"
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
          lg:w-[320px]
        "
      >
        In Google Maps öffnen →
      </a>
    </section>
  );
}

export default ContactMap;
