import "vitest-browser-react";
import "../App.css";
import { afterEach, beforeEach, vi } from "vitest";
import { clearMenuCache } from "../lib/api";

beforeEach(() => {
  clearMenuCache();
  localStorage.clear();
  window.scrollTo(0, 0);
});

afterEach(() => {
  vi.restoreAllMocks();
});
