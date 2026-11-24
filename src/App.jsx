import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Maintenance from "./pages/Maintenance";
import { routes } from "./routes";

const maintenance = false;

const router = createBrowserRouter(routes);

function App() {
  if (maintenance) {
    return <Maintenance />;
  }

  return <RouterProvider router={router} />;
}

export default App;
