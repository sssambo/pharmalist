import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	server: {
		port: 3000,
		proxy: {
			"/api": {
				target: process.env.BACKEND_URL,
				changeOrigin: true,
			},
		},
		allowedHosts: ["2578357661ca.ngrok-free.app"],
	},
});
