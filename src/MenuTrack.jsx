import { NavLink } from "react-router-dom";
import Logo from "./Logo";

function MenuTrack() {
  const linkStyle = ({ isActive }) =>
    `font-oswald whitespace-nowrap font-normal text-white transition-colors hover:text-[#ffaf01] ${
      isActive ? "border-b-2 border-[#ffaf01]" : ""
    }`;

  return (
    <div className="absolute top-0 left-0 z-20 flex w-full items-center justify-between px-3 pt-3 sm:px-5 lg:translate-y-3 lg:px-[30px]">
      <div className="shrink-0">
        <Logo />
      </div>

      <nav className="flex shrink-0 items-center gap-3 sm:gap-6 lg:mr-[30px] lg:gap-[30px]">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${linkStyle({ isActive })} text-sm sm:text-base`
          }
        >
          HOME
        </NavLink>

        <NavLink
          to="/menu"
          className={({ isActive }) =>
            `${linkStyle({ isActive })} text-sm sm:text-base`
          }
        >
          MENU
        </NavLink>

        <NavLink
          to="/contact"
          className={({ isActive }) =>
            `flex h-9 w-[116px] shrink-0 items-center justify-center whitespace-nowrap bg-[#ffaf01] font-oswald text-xs font-normal text-black transition-colors hover:text-white sm:h-10 sm:w-[160px] sm:text-base ${
              isActive ? "border-b-2 border-white" : ""
            }`
          }
        >
          KONTAKT | RESERVIEREN
        </NavLink>
      </nav>
    </div>
  );
}

export default MenuTrack;
