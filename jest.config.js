/** @type {import('jest').Config} */

export default {
  modulePathIgnorePatterns: ["./config/"],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
};
