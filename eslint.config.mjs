import {defineConfig} from "eslint/config";
import globals from "globals";
import {flatConfigs as importX} from "eslint-plugin-import-x";
import js from "@eslint/js";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import stylistic from "@stylistic/eslint-plugin";

export default defineConfig([
  {
    files: ["**/*.{js,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
        Log: "readonly",
        Module: "readonly",
        config: "readonly"
      }
    },
    plugins: {js, stylistic},
    extends: [importX.recommended, "js/all", "stylistic/all"],
    rules: {
      "@stylistic/array-element-newline": ["error", "consistent"],
      "@stylistic/dot-location": ["error", "property"],
      "@stylistic/function-call-argument-newline": ["error", "consistent"],
      "@stylistic/indent": ["error", 2],
      "@stylistic/object-property-newline": "off",
      "@stylistic/padded-blocks": ["error", "never"],
      "@stylistic/quote-props": ["error", "as-needed"],
      "func-style": "off",
      "import-x/no-unresolved": ["error", {ignore: ["eslint/config"]}],
      "init-declarations": "off",
      "max-lines-per-function": ["error", 100],
      "max-statements": ["error", 50],
      "no-magic-numbers": "off",
      "one-var": ["error", "never"],
      "prefer-destructuring": "off",
      "sort-keys": "off"
    }
  },
  {files: ["**/*.json"], ignores: ["package-lock.json"], plugins: {json}, language: "json/json", extends: ["json/recommended"]},
  {files: ["**/*.md"], plugins: {markdown}, language: "markdown/gfm", extends: ["markdown/recommended"]}
]);
