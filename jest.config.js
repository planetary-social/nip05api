/** @type {import('jest').Config} */

export default {
  modulePathIgnorePatterns: ["<rootDir>/config/"],
  coveragePathIgnorePatterns: ["<rootDir>/config/"],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
};
