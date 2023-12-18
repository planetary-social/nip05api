/** @type {import('jest').Config} */

export default {
  modulePathIgnorePatterns: ["./config/"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
