import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";

function SiteLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main id="inhalt" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default SiteLayout;
