import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { render } from "vitest-browser-react";
import { routes } from "../routes";

export async function renderApp(path = "/", { state } = {}) {
  const router = createMemoryRouter(routes, {
    initialEntries: [state ? { pathname: path, state } : path],
  });

  const screen = await render(<RouterProvider router={router} />);

  return { ...screen, router };
}
