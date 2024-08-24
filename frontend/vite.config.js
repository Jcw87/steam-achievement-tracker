import "dotenv/config";
import { dirname } from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const proxyOptions = {
    target: `http://127.0.0.1:${process.env.BACKEND_PORT}`,
    changeOrigin: false,
    secure: true,
    ws: false,
};

const host = process.env.HOST ? new URL(process.env.HOST).hostname : "localhost";

let hmrConfig;
if (host === "localhost") {
    hmrConfig = {
        protocol: "ws",
        host: "localhost",
        port: 64999,
        clientPort: 64999,
    };
} else {
    hmrConfig = {
        protocol: "wss",
        host: host,
        port: process.env.FRONTEND_PORT,
        clientPort: 443,
    };
}

export default defineConfig({
    root: dirname(fileURLToPath(import.meta.url)),
    plugins: [react()],
    resolve: {
        preserveSymlinks: true,
    },
    server: {
        host: "localhost",
        port: process.env.FRONTEND_PORT,
        hmr: hmrConfig,
        proxy: {
            "^/(\\?.*)?$": proxyOptions,
            "^/api(/|(\\?.*)?$)": proxyOptions,
            "^/auth(/|(\\?.*)?$)": proxyOptions,
        },
    },
});
