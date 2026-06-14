module.exports = {
  root: true,
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    "no-console": "off",
  },
  ignorePatterns: ["node_modules", "dist", "build", ".next"],
};