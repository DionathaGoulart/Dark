const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const reactPlugin = require("eslint-plugin-react");
const hooksPlugin = require("eslint-plugin-react-hooks");
const nextPlugin = require("@next/eslint-plugin-next");

module.exports = tseslint.config(
    { ignores: [".next/*", "node_modules/*", ".turbo/*", "dist/*", "eslint.config.js", "next-env.d.ts", "postcss.config.js", "*.config.js"] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
        plugins: {
            react: reactPlugin,
            "react-hooks": hooksPlugin,
            "@next/next": nextPlugin,
        },
        rules: {
            ...reactPlugin.configs.flat?.recommended?.rules ?? {},
            ...hooksPlugin.configs.recommended.rules,
            ...nextPlugin.configs.recommended.rules,
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "no-undef": "off",
            "no-empty": "off",
            "@typescript-eslint/no-empty-object-type": "off",
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-require-imports": "off"
        },
        settings: {
            react: { version: "detect" },
        }
    }
);
