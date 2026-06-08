import { jest } from "@jest/globals";

describe("src/index module", () => {
  it("can be imported without throwing", async () => {
    await expect(import("../src/index.js")).resolves.toBeDefined();
  });
});
