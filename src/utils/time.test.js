/*This test suite verifies the behavior of the parseMoscow function, 
which parses date strings and interprets them in the context 
of the Moscow timezone (UTC+3).*/

import { parseMoscow } from "./time";

describe("parseMoscow", () => {
  it("parses ISO string without timezone as MSK (UTC+3)", () => {
     //'2025-06-20T12:00' without "Z" or any offset
    const d = parseMoscow("2025-06-20T12:00");
    expect(d.toISOString().startsWith("2025-06-20T09:00")).toBe(true); //the expected output should be 2025-06-20T09:00Z (i.e., 12:00 Moscow time minus 3 hours to UTC)
  });

  it("parses ISO string with Z correctly", () => {
    const d = parseMoscow("2025-06-20T12:00Z");
    //since this string is already in UTC, it should stay the same
    expect(d.toISOString().startsWith("2025-06-20T12:00")).toBe(true);
  });
});
