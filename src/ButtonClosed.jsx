function ButtonClosed({ setMenuOpen, menuOpen }) {
  return (
    <button
      type="button"
      onClick={() => setMenuOpen(!menuOpen)}
      className="relative z-[60] flex h-8 w-8 items-center justify-center lg:hidden"
    >
      <span className="absolute h-[3px] w-8 rotate-45 bg-white"></span>
      <span className="absolute h-[3px] w-8 -rotate-45 bg-white"></span>
    </button>
  );
}

export default ButtonClosed;
