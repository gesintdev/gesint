import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const nextConfig: NextConfig = {
    output: "standalone",
    async redirects() {
        return [{source: "/", destination: "/dashboard", permanent: false}];
    },
    turbopack: {
        // Monorepo tem package-lock na raiz (tooling); o app Next vive aqui.
        root: projectRoot,
    },
};

export default nextConfig;
