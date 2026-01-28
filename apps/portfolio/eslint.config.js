const { FlatCompat } = require("@eslint/eslintrc");
const path = require("path");
const { fileURLToPath } = require("url");

// Compatibility wrapper for Next.js config
const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals"),
    ...compat.extends("next/typescript"),
];

module.exports = eslintConfig;
