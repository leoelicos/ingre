import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{ ignores: ["coverage/**", "node_modules/**"] }, ...compat.extends("prettier"), {
    files: ["src/**/*.ts"],
    plugins: {
        "@typescript-eslint": tsPlugin,
    },

    languageOptions: {
        parser: tsParser,
    },

    rules: {
        quotes: [2, "single"],
        "no-console": "off",
        "no-duplicate-imports": 2,
        "object-literal-sort-keys": 0,
        "no-trailing-whitespace": 0,
        "max-classes-per-file": [2, 15],
        "@typescript-eslint/no-explicit-any": "error",
    },
}];