function WoodBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      <img
        src="/contact-background/contact-background-image.webp"
        alt=""
        className="size-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/65 to-black/85" />
    </div>
  );
}

export default WoodBackdrop;
