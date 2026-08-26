import type { ParsedPage } from "../../parsing/types.js";

export interface QuoteLocation {
  page: number | null;
  start: number | null;
  end: number | null;
  matchKind: "exact" | "normalized" | "none";
  confidence: number;
}

const NONE: QuoteLocation = {
  page: null,
  start: null,
  end: null,
  matchKind: "none",
  confidence: 0.0,
};

/**
 * Try an exact `indexOf` on `text`. Returns `[start, end)` or null.
 */
function exactMatch(text: string, quote: string): [number, number] | null {
  const idx = text.indexOf(quote);
  if (idx === -1) return null;
  return [idx, idx + quote.length];
}

/**
 * Build a whitespace-stripped version of `text` plus a map from stripped index
 * back to original index.
 */
function buildNormalized(text: string): { norm: string; origIndex: number[] } {
  const chars: string[] = [];
  const origIndex: number[] = [];
  for (let i = 0; i < text.length; i++) {
    if (!/\s/.test(text[i])) {
      chars.push(text[i]);
      origIndex.push(i);
    }
  }
  return { norm: chars.join(""), origIndex };
}

/**
 * Whitespace-normalized match. Returns original `[start, end)` or null.
 */
function normalizedMatch(
  text: string,
  quote: string,
): [number, number] | null {
  const hay = buildNormalized(text);
  const needle = buildNormalized(quote);
  if (needle.norm.length === 0) return null;

  const idx = hay.norm.indexOf(needle.norm);
  if (idx === -1) return null;

  const origStart = hay.origIndex[idx];
  const origEnd = hay.origIndex[idx + needle.norm.length - 1] + 1;
  return [origStart, origEnd];
}

/**
 * Verify that the LLM's quote actually exists in the parsed page text.
 *
 * Cascade: exact match on hinted page → exact on all pages → normalized on
 * hinted page → normalized on all pages → none.
 *
 * Confidence: 0.9 exact, 0.7 normalized, 0.0 none.
 */
export function resolveQuote(
  quote: string | null,
  pages: ParsedPage[],
  hintedPage: number | null,
): QuoteLocation {
  if (!quote || pages.length === 0) return NONE;

  // Order pages so the hinted page comes first (tiebreak for short quotes that
  // appear on multiple pages).
  const ordered = hintedPage
    ? [
        ...pages.filter((p) => p.page === hintedPage),
        ...pages.filter((p) => p.page !== hintedPage),
      ]
    : pages;

  // Pass 1: exact match
  for (const pg of ordered) {
    const hit = exactMatch(pg.text, quote);
    if (hit) {
      return {
        page: pg.page,
        start: hit[0],
        end: hit[1],
        matchKind: "exact",
        confidence: 0.9,
      };
    }
  }

  // Pass 2: whitespace-normalized match
  for (const pg of ordered) {
    const hit = normalizedMatch(pg.text, quote);
    if (hit) {
      return {
        page: pg.page,
        start: hit[0],
        end: hit[1],
        matchKind: "normalized",
        confidence: 0.7,
      };
    }
  }

  return NONE;
}