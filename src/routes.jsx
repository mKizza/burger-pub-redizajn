import RootLayout from "./components/layout/RootLayout";
import SiteLayout from "./components/layout/SiteLayout";
import AdminShell from "./pages/admin/AdminShell";
import { Admin, AdminLogin } from "./pages/admin/lazyPages";
import RequireAdmin from "./pages/admin/RequireAdmin";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import NotFound from "./pages/NotFound";

export const routes = [
  {
    element: <RootLayout />,
    children: [
      {
        element: <SiteLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: "menu", element: <Menu /> },
          { path: "contact", element: <Contact /> },
          { path: "*", element: <NotFound /> },
        ],
      },
      {
        element: <AdminShell />,
        children: [
          { path: "admin-login", element: <AdminLogin /> },
          {
            path: "admin",
            element: (
              <RequireAdmin>
                <Admin />
              </RequireAdmin>
            ),
          },
        ],
      },
    ],
  },
];
