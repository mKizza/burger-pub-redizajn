function ContactMap() {
  return (
    <section className="mt-12 flex w-full flex-col gap-5 px-5">
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
