function ContactInfo() {
  return (
    <section className="w-full px-5">
      <div className="grid grid-cols-2 gap-x-5 gap-y-8">
        {/* LIJEVA KOLONA */}
        <div className="flex flex-col gap-8">
          {/* ADRESSE */}
          <div className="flex items-center gap-3">
            <div>
              {/* Adresa */}

              {/* ADRESSE */}
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Milbertshofener+Str.+34,+80807+München-Milbertshofen-Am+Hart,+Germany"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3"
              >
                <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full border-2 border-[#ffaf01]">
                  <span className="text-[22px] text-[#ffaf01]">●</span>
                </div>

                <div>
                  <h3 className="font-oswald text-[15px] font-bold uppercase text-[#ffaf01]">
                    Adresse
                  </h3>

                  <p className="mt-1 font-oswald text-[11px] leading-4 text-white">
                    Milbertshofener Str. 34
                    <br />
                    80807 München
                  </p>
                </div>
              </a>

              {/* Adresa */}
            </div>
          </div>

          {/* TELEFON */}
          <div className="flex items-center gap-3">
            {/* Telefon */}

            <a href="tel:+498932795957" className="flex items-center gap-3">
              <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full border-2 border-[#ffaf01]">
                <span className="text-[21px] text-[#ffaf01]">☎</span>
              </div>

              <div>
                <h3 className="font-oswald text-[15px] font-bold uppercase text-[#ffaf01]">
                  Telefon
                </h3>

                <p className="mt-1 font-oswald text-[11px] text-white">
                  +49 89 32795957
                </p>
              </div>
            </a>

            {/* Telefon */}
          </div>
        </div>

        {/* DESNA KOLONA */}
        <div className="flex flex-col gap-8">
          {/* E-MAIL */}
          <div className="flex items-center gap-3">
            <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full border-2 border-[#ffaf01]">
              <span className="text-[21px] text-[#ffaf01]">✉</span>
            </div>

            <div className="min-w-0">
              <h3 className="font-oswald text-[15px] font-bold uppercase text-[#ffaf01]">
                E-Mail
              </h3>

              <p className="mt-1 break-all font-oswald text-[11px] text-white">
                burgerpubmunchen@gmail.com
              </p>
            </div>
          </div>

          {/* INSTAGRAM */}
          <div className="flex items-center gap-3">
            {/* INSTAGRAM */}
            <a
              href="https://www.instagram.com/burgerpubmunchen_/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3"
            >
              <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full border-2 border-[#ffaf01]">
                <span className="text-[20px] text-[#ffaf01]">◎</span>
              </div>

              <div className="min-w-0">
                <h3 className="font-oswald text-[15px] font-bold uppercase text-[#ffaf01]">
                  Instagram
                </h3>

                <p className="mt-1 font-oswald text-[11px] text-white">
                  @burgerpubmunchen_
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactInfo;
