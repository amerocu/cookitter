export default {
  preset: "ts-jest", // Tells Jest to use ts-jest for TypeScript
  testEnvironment: "node", // Use "jsdom" if testing browser-related code
  transform: {
    "^.+\\.tsx?$": "ts-jest", // Transforms TypeScript files
  },
  moduleFileExtensions: ["ts", "tsx", "js"],
  extensionsToTreatAsEsm: [".ts"],
};
