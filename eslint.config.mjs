import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default tseslint.config(tseslint.configs.strictTypeChecked, eslintPluginPrettierRecommended, {
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname + "/src/main/resources",
    },
  },
  rules: {
    "@typescript-eslint/no-unnecessary-condition": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
  },
});
