import HamburgerMenu from "./HamburgerMenu";
import Logo from "./Logo";

function MenuTrack() {
  return (
    <div className="allside-padding relative flex w-full items-center justify-between">
      <Logo />
      {/* Desktop navigation */}
      <nav className="hidden items-center gap-[30px] mr-[30px] mb-[30px] lg:flex">
        <a href="#home">HOME</a>
        <a href="#menu">MENU</a>
        <a href="#lunch">LUNCH</a>
        <a href="#drinks">DRINKS</a>
        <a href="#about">ABOUT</a>
        <a href="#contact">CONTACT</a>

        <a href="#reservieren" className="reservation">
          TISCH RESERVIEREN
        </a>
      </nav>
      {/* Hamburger */}
      <HamburgerMenu />
      {/* Mobile menu */}
    </div>
  );
}

export default MenuTrack;
