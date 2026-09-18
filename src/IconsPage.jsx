function IconsPage() {
  return (
    <a
      href="https://www.google.com/maps/dir/?api=1&destination=Milbertshofener+Str.+34,+80807+M%C3%BCnchen,+Germany"
      target="_blank"
      rel="noopener noreferrer"
      className="relative z-10 flex flex-row items-center gap-3 -translate-y-12 cursor-pointer pointer-events-auto"
    >
      <img
        src="/icons/location.png"
        alt="Lokacija"
        className="w-8 h-8 object-contain cursor-pointer"
      />
      <div className="flex flex-col">
        <span className="text-white">Milbertshofener Str. 34</span>
        <span className="text-white">80807 München</span>
      </div>
    </a>
  );
}

export default IconsPage;
