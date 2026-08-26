import { useState } from "react";
import ButtonOpen from "./ButtonOpen";
import HamburgerMenuOptions from "./HamburgerMenuOptions";
import ButtonClosed from "./ButtonClosed";

function HamburgerMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div>
      {menuOpen ? (
        <ButtonClosed menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      ) : (
        <ButtonOpen menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      )}

      {menuOpen && <HamburgerMenuOptions />}
    </div>
  );
}

export default HamburgerMenu;
