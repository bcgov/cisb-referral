import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock browser location for jsdom environment
Object.defineProperty(globalThis, "location", {
  value: {
    origin: "http://test.local",
    href: "http://test.local",
    pathname: "/",
    search: "",
    hash: "",
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
  writable: true,
});
