function ButtonOpen({ menuOpen, setMenuOpen }) {
  return (
    <button
      type="button"
      onClick={() => setMenuOpen(!menuOpen)}
      className="flex flex-col gap-1.5 lg:hidden"
    >
      <span className="h-[3px] w-8 bg-white"></span>
      <span className="h-[3px] w-8 bg-white"></span>
      <span className="h-[3px] w-8 bg-white"></span>
    </button>
  );
}

export default ButtonOpen;
