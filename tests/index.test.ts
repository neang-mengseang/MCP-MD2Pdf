import { jest } from "@jest/globals";

describe("src/lib module", () => {
  it("can be imported without throwing", async () => {
    await expect(import("../src/lib.js")).resolves.toBeDefined();
  });
});

describe("src/index module", () => {
  it("re-exports the library without side effects", async () => {
    await expect(import("../src/index.js")).resolves.toBeDefined();
  });
});
