module.exports = {
  root: true,
  parserOptions: {
    sourceType: "module",
  },

  extends: ["@metamask/eslint-config"],

  "prettier/prettier": [
    "error",
    {
      endOfLine: "auto",
    },
  ],

  overrides: [
    {
      files: ["**/*.js"],
      extends: ["@metamask/eslint-config-nodejs"],
      rules: {
        "prettier/prettier": [
          "error",
          {
            endOfLine: "auto",
          },
        ],
      },
    },

    {
      files: ["**/*.{ts,tsx}"],
      extends: ["@metamask/eslint-config-typescript"],
      rules: {
        "@typescript-eslint/consistent-type-definitions": ["error", "type"],
        "prettier/prettier": [
          "error",
          {
            endOfLine: "auto",
          },
        ],
      },
    },

    {
      files: ["**/*.test.ts", "**/*.test.js"],
      extends: ["@metamask/eslint-config-jest"],
      rules: {
        "@typescript-eslint/no-shadow": [
          "error",
          { allow: ["describe", "expect", "it"] },
        ],
        "prettier/prettier": [
          "error",
          {
            endOfLine: "auto",
          },
        ],
      },
    },
  ],

  ignorePatterns: [
    "!.prettierrc.js",
    "**/!.eslintrc.js",
    "**/dist*/",
    "**/*__GENERATED__*",
    "**/build",
    "**/public",
    "**/.cache",
  ],
};
