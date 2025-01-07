import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

// Después de cada test realizado se va a limpiar el DOM simulado.
afterEach(() => {
  cleanup();
});
