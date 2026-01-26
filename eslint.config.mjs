import { defineConfig } from "eslint-config-zoro";

export default defineConfig({
    typescript: true,

    ignores: ["dist/**"],
    languageOptions: {
        parserOptions: {
            project: "./tsconfig.eslint.json"
        }
    },
    rules: {
        "@stylistic/no-mixed-operators": "off",
        "no-param-reassign": "off"
    }
});
