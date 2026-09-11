import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  rules: {
    "prefer-const": "error",
    "no-console": "warn",
    "eqeqeq": ["error", "always"],
    "vue/no-multiple-template-root": "off",
  },
  ignores: ["tests/**/*"],
}).override("nuxt/stylistic", {
  rules: {
    "@stylistic/quotes": ["error", "double"],
    "@stylistic/semi": ["error", "always"],
  },
});
