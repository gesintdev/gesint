import eslintConfigPrettier from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";

/** Regras compartilhadas entre gommo-frontend e gommo-admin-frontend. */
export const sharedLintConfig = [
    eslintConfigPrettier,
    {
        plugins: {
            "simple-import-sort": simpleImportSort,
            "unused-imports": unusedImports,
        },
        rules: {
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",
            // Auto-fix ja removeu imports usados apenas como tipo em varios arquivos; use tsc para validar.
            "unused-imports/no-unused-imports": "warn",
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    varsIgnorePattern: "^_",
                    args: "after-used",
                    argsIgnorePattern: "^_",
                },
            ],
            // Form clients reset via CrudScreen form key; detail hydration still uses effects.
            "react-hooks/set-state-in-effect": "off",
        },
    },
];
