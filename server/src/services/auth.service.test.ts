import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./auth.service.js";

describe("password hashing", () => {
  it("does not store the raw password", async () => {
    const hash = await hashPassword("CorrectHorse9!");
    expect(hash).not.toBe("CorrectHorse9!");
    expect(await verifyPassword("CorrectHorse9!", hash)).toBe(true);
  });
  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("CorrectHorse9!");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });
});
