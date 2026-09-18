function ContactNaslov() {
  return (
    <div className="flex w-full flex-col items-center px-5 pb-10 pt-5">
      <div className="flex w-full items-center justify-center gap-4">
        <div className="h-[1px] flex-1 bg-[#ffaf01]" />

        <h1 className="font-anton text-[52px] leading-none text-[#ffaf01]">
          KONTAKT
        </h1>

        <div className="h-[1px] flex-1 bg-[#ffaf01]" />
      </div>

      <p className="mt-2 font-oswald text-[13px] uppercase tracking-[0.35em] text-white">
        Wir freuen uns auf dich.
      </p>
    </div>
  );
}

export default ContactNaslov;
