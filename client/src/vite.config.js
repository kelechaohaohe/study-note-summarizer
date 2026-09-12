import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Standard Vite + React config. No extra setup needed.
export default defineConfig({
  plugins: [react()],
});