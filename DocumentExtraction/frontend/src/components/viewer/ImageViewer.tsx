import { Alert, Box } from "@mui/material";
import { useState } from "react";
import type { ActiveQuote } from "../../types";
import HighlightOverlay from "./HighlightOverlay";
import ViewerToolbar from "./ViewerToolbar";

interface ImageViewerProps {
  url: string;
  filename: string;
  activeQuote: ActiveQuote | null;
}

/**
 * Scanned pages and photos.
 *
 * There is no text layer to search, so highlighting needs OCR word boxes — and
 * the parser currently keeps only Tesseract's text, discarding res.data.words.
 * The overlay is wired up regardless: once those boxes are stored, the work here
 * is scaling them to the rendered size and passing them in as rects.
 */
export default function ImageViewer({
  url,
  filename,
  activeQuote,
}: ImageViewerProps) {
  const [scale, setScale] = useState(1);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <ViewerToolbar
        filename={filename}
        fileUrl={url}
        onZoomIn={() => setScale((current) => Math.min(4, current + 0.25))}
        onZoomOut={() => setScale((current) => Math.max(0.5, current - 0.25))}
        onZoomReset={() => setScale(1)}
      />

      {activeQuote && (
        <Alert severity="info" square sx={{ borderRadius: 0 }}>
          Scanned pages carry no text coordinates yet — the quote is shown on the
          value.
        </Alert>
      )}

      <Box sx={{ flexGrow: 1, minHeight: 0, overflow: "auto", p: 2 }}>
        <Box
          sx={{
            position: "relative",
            width: `${scale * 100}%`,
            mx: "auto",
            transition: "width 120ms",
          }}
        >
          <img
            src={url}
            alt={filename}
            style={{ width: "100%", display: "block" }}
          />
          <HighlightOverlay rects={[]} />
        </Box>
      </Box>
    </Box>
  );
}
