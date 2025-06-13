import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off", // Change to "warn" or "off"
      "react-hooks/exhaustive-deps": "off", // Adjust warnings for missing dependencies
      "@typescript-eslint/no-explicit-any": "off", // Disable explicit any warnings
      "react-hooks/rules-of-hooks": "warn", // Change from error to warning
      "react/no-unescaped-entities": "off", // Disable unescaped entities errors
      "@next/next/no-page-custom-font": "warn", // Change to warning
      "@next/next/no-img-element": "warn", // Change to warning
    },
  },
];

export default eslintConfig;