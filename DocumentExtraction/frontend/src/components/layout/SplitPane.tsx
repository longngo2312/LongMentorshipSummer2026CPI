import { Box, Tab, Tabs, useMediaQuery, useTheme } from "@mui/material";
import { useCallback, useRef, useState } from "react";
import type { ReactNode } from "react";

const MIN_PERCENT = 25;
const MAX_PERCENT = 75;

export type SplitPaneTab = "left" | "right";

interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
  leftLabel: string;
  rightLabel: string;
  /** Which pane is showing on narrow screens. Controlled so callers can switch
   *  to the document pane when the reviewer clicks a quote. */
  mobileTab: SplitPaneTab;
  onMobileTabChange: (tab: SplitPaneTab) => void;
  initialLeftPercent?: number;
}

/**
 * Two panes with a draggable divider, collapsing to tabs under `md` — a 45%
 * panel on a phone is unusable for both reading a document and editing values.
 */
export default function SplitPane({
  left,
  right,
  leftLabel,
  rightLabel,
  mobileTab,
  onMobileTabChange,
  initialLeftPercent = 55,
}: SplitPaneProps) {
  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.down("md"));

  const containerRef = useRef<HTMLDivElement>(null);
  const [leftPercent, setLeftPercent] = useState(initialLeftPercent);
  const [dragging, setDragging] = useState(false);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const bounds = container.getBoundingClientRect();
    const percent = ((event.clientX - bounds.left) / bounds.width) * 100;
    setLeftPercent(Math.min(MAX_PERCENT, Math.max(MIN_PERCENT, percent)));
  }, []);

  if (isNarrow) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Tabs
          value={mobileTab}
          onChange={(_event, value) => onMobileTabChange(value as SplitPaneTab)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: "divider", flexShrink: 0 }}
        >
          <Tab value="left" label={leftLabel} />
          <Tab value="right" label={rightLabel} />
        </Tabs>
        <Box sx={{ flexGrow: 1, minHeight: 0, overflow: "auto" }}>
          {mobileTab === "left" ? left : right}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{ display: "flex", height: "100%", minHeight: 0 }}
      // Move and up are handled on the container, not the divider: the pointer
      // routinely outruns a 6px handle during a fast drag.
      onPointerMove={dragging ? handlePointerMove : undefined}
      onPointerUp={() => setDragging(false)}
      onPointerLeave={() => setDragging(false)}
    >
      <Box sx={{ width: `${leftPercent}%`, minWidth: 0, overflow: "hidden" }}>
        {left}
      </Box>

      <Box
        onPointerDown={() => setDragging(true)}
        sx={{
          flexShrink: 0,
          width: 6,
          cursor: "col-resize",
          bgcolor: dragging ? "primary.main" : "divider",
          transition: dragging ? "none" : "background-color 120ms",
          "&:hover": { bgcolor: "primary.light" },
        }}
      />

      <Box sx={{ flexGrow: 1, minWidth: 0, overflow: "hidden" }}>{right}</Box>

      {/* While dragging, the pointer crossing the PDF or the table would
          otherwise start a text selection and fight the drag. */}
      {dragging && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 10,
            cursor: "col-resize",
          }}
        />
      )}
    </Box>
  );
}
