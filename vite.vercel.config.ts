import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// This is a specialized Vite configuration for Vercel deployment
// The regular vite.config.ts is still used for Replit deployment
export default defineConfig({
  plugins: [
    react(),
  ],
  // Keep the root in the client directory
  root: "client",
  build: {
    // Output to ../dist so Vercel can find the build artifacts
    outDir: "../dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      // Maintain the same alias structure for compatibility
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
});