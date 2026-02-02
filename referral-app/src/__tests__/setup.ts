import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock browser location for jsdom environment
Object.defineProperty(globalThis, "location", {
  value: {
    origin: "https://test.local",
    href: "https://test.local",
    pathname: "/",
    search: "",
    hash: "",
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
  writable: true,
});
