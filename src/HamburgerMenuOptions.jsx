function HamburgerMenuOptions({ setMenuOpen }) {
  return (
    <nav className="absolute right-5 top-[10px] z-50 flex flex-col items-center gap-5 rounded-md border-2 border-[#f58220] bg-black/95 p-6 text-center text-lg font-semibold lg:hidden">
      <a
        href="#home"
        onClick={() => setMenuOpen(false)}
        className="transition-colors hover:text-[#f58220]"
      >
        HOME
      </a>

      <a
        href="#menu"
        onClick={() => setMenuOpen(false)}
        className="transition-colors hover:text-[#f58220]"
      >
        MENU
      </a>

      <a
        href="#lunch"
        onClick={() => setMenuOpen(false)}
        className="transition-colors hover:text-[#f58220]"
      >
        LUNCH
      </a>

      <a
        href="#drinks"
        onClick={() => setMenuOpen(false)}
        className="transition-colors hover:text-[#f58220]"
      >
        DRINKS
      </a>

      <a
        href="#about"
        onClick={() => setMenuOpen(false)}
        className="transition-colors hover:text-[#f58220]"
      >
        ABOUT
      </a>

      <a
        href="#contact"
        onClick={() => setMenuOpen(false)}
        className="transition-colors hover:text-[#f58220]"
      >
        CONTACT
      </a>

      <a
        href="#reservieren"
        onClick={() => setMenuOpen(false)}
        className="transition-colors hover:text-[#f58220]"
      >
        TISCH RESERVIEREN
      </a>
    </nav>
  );
}

export default HamburgerMenuOptions;
