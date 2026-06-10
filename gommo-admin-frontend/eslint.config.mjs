import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

import { sharedLintConfig } from "../config/eslint.shared.mjs";

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    ...sharedLintConfig,
    globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "scripts/**"]),
]);

export default eslintConfig;
