import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "gbtrip.pk — Car rentals · Gilgit Baltistan",
        short_name: "GB Trip",
        description:
          "Book verified cars, jeeps, and SUVs from trusted local owners across Gilgit Baltistan.",
        theme_color: "#1a33b3",
        background_color: "#f3f5fb",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "/pwa-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
        ],
      },
    }),
  ],
});
