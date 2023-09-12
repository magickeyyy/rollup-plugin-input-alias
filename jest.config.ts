import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    detectOpenHandles: true,
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageReporters: ["json-summary"],
};

export default config;
