import { Box } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { Page } from "react-pdf";
import type { ActiveQuote } from "../../types";
import {
  findBestRange,
  firstWords,
  rectsFromRange,
} from "../../utils/quoteSearch";
import type { HighlightRect } from "../../utils/quoteSearch";
import HighlightOverlay from "./HighlightOverlay";

// react-pdf renders the text layer into this container; the spans inside it are
// in the same order as the page's text items, which is what the search relies on.
const SPAN_SELECTOR = ".react-pdf__Page__textContent span";

interface PdfPageLayerProps {
  pageNumber: number;
  width: number;
  /** Non-null only when this page is the active quote's target. */
  activeQuote: ActiveQuote | null;
  /** Second rung of the fallback ladder — the field's extracted value. */
  fallbackValue: string | null;
  onLocate: (found: boolean) => void;
}

export default function PdfPageLayer({
  pageNumber,
  width,
  activeQuote,
  fallbackValue,
  onLocate,
}: PdfPageLayerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const [rects, setRects] = useState<HighlightRect[]>([]);
  // Bumped by onRenderTextLayerSuccess: the spans do not exist before it fires,
  // and they are replaced wholesale whenever the page re-renders at a new width.
  const [textLayerVersion, setTextLayerVersion] = useState(0);

  const locate = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !activeQuote) {
      setRects([]);
      return;
    }

    const spans = Array.from(
      wrapper.querySelectorAll<HTMLElement>(SPAN_SELECTOR),
    );

    // No spans means the text layer has not painted yet, not that the quote is
    // missing. Reporting a miss here flashes the warning banner on every page
    // load, a moment before the real search succeeds.
    if (spans.length === 0) {
      setRects([]);
      return;
    }

    // The model paraphrases, and OCR text rarely matches verbatim — landing on
    // roughly the right line beats highlighting nothing at all.
    const range = findBestRange(spans, [
      activeQuote.quote,
      firstWords(activeQuote.quote, 6),
      fallbackValue,
    ]);

    if (!range) {
      setRects([]);
      onLocate(false);
      return;
    }

    setRects(rectsFromRange(range, wrapper));
    onLocate(true);
  }, [activeQuote, fallbackValue, onLocate]);

  useEffect(() => {
    locate();
  }, [locate, textLayerVersion, width]);

  // Rects are pixel offsets, so they are only valid for the layout that produced
  // them. A window resize silently invalidates every one.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const observer = new ResizeObserver(() => locate());
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [locate]);

  useEffect(() => {
    if (rects.length === 0) return;
    markerRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [rects]);

  return (
    <Box
      ref={wrapperRef}
      sx={{
        // The overlay is absolutely positioned against this box.
        position: "relative",
        mb: 2,
        mx: "auto",
        width: "fit-content",
        boxShadow: 2,
      }}
    >
      <Page
        pageNumber={pageNumber}
        width={width}
        renderTextLayer
        renderAnnotationLayer={false}
        onRenderTextLayerSuccess={() =>
          setTextLayerVersion((version) => version + 1)
        }
      />

      <HighlightOverlay rects={rects} />

      {/* Scroll target: scrolling the page wrapper would land on the top of the
          page, which for a quote near the bottom is the wrong place entirely. */}
      {rects.length > 0 && (
        <Box
          ref={markerRef}
          sx={{
            position: "absolute",
            top: rects[0].top,
            left: rects[0].left,
            width: 1,
            height: rects[0].height,
            pointerEvents: "none",
          }}
        />
      )}
    </Box>
  );
}
