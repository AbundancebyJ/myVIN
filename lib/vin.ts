// VIN validation (ISO 3779 / 49 CFR 565). Runs entirely client-side before any API call.

const TRANSLITERATION: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
};
const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

export type VinCheck =
  | { ok: true; vin: string }
  | { ok: false; vin: string; error: string };

/** Uppercases and strips whitespace/dashes people paste in from listings. */
export function normalizeVin(input: string): string {
  return input.toUpperCase().replace(/[\s-]/g, "");
}

export function computeCheckDigit(vin: string): string {
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const ch = vin[i];
    const value = /[0-9]/.test(ch) ? Number(ch) : TRANSLITERATION[ch];
    if (value === undefined) return "";
    sum += value * WEIGHTS[i];
  }
  const rem = sum % 11;
  return rem === 10 ? "X" : String(rem);
}

export function validateVin(input: string): VinCheck {
  const vin = normalizeVin(input);
  if (vin.length === 0) return { ok: false, vin, error: "Enter the 17-character VIN." };
  if (vin.length !== 17) {
    return {
      ok: false,
      vin,
      error: `A VIN has exactly 17 characters. You entered ${vin.length}.`,
    };
  }
  const bad = vin.match(/[IOQ]/);
  if (bad) {
    return {
      ok: false,
      vin,
      error: `VINs never contain the letters I, O, or Q (found "${bad[0]}"). Did you mean ${
        bad[0] === "Q" || bad[0] === "O" ? "0 (zero)" : "1 (one)"
      }?`,
    };
  }
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
    return { ok: false, vin, error: "A VIN can only contain letters and numbers." };
  }
  const expected = computeCheckDigit(vin);
  if (vin[8] !== expected) {
    return {
      ok: false,
      vin,
      error:
        "This VIN doesn't pass the check-digit test (9th character), so at least one character is probably mistyped. Compare it against the windshield or door-jamb label.",
    };
  }
  return { ok: true, vin };
}
