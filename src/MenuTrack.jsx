import { NavLink } from "react-router-dom";
import Logo from "./Logo";

function MenuTrack({ centered = false }) {
  return (
    <div className="allside-padding absolute top-0 z-20 flex w-full lg:translate-y-3 items-center justify-between ">
      <Logo />

      <nav
        className={
          centered
            ? "absolute left-1/2 -translate-x-1/2 mb-[30px] flex items-center gap-[30px]"
            : "mr-[30px] mb-[30px] flex items-center gap-[30px]"
        }
      >
        <NavLink
          to="/"
          className={({ isActive }) =>
            `font-oswald font-normal text-white hover:text-[#ffaf01] ${
              isActive ? "border-b-2 border-[#ffaf01]" : ""
            }`
          }
        >
          HOME
        </NavLink>

        <NavLink
          to="/menu"
          className={({ isActive }) =>
            `font-oswald font-normal text-white hover:text-[#ffaf01] ${
              isActive ? "border-b-2 border-[#ffaf01]" : ""
            }`
          }
        >
          MENU
        </NavLink>

        <NavLink
          to="/contact"
          className={({ isActive }) =>
            `flex h-10 w-25 items-center justify-center bg-[#ffaf01] font-oswald font-normal text-black hover:text-white ${
              isActive ? "border-b-2 border-[#ffaf01]" : ""
            }`
          }
        >
          KONTAKT
        </NavLink>
      </nav>
    </div>
  );
}

export default MenuTrack;
