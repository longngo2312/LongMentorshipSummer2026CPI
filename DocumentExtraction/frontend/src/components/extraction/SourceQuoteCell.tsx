import { Box, Chip, Tooltip, Typography } from "@mui/material";
import type { ExtractedValueRow } from "../../types";
import { formatConfidence } from "../../utils/extractedValue";

const MATCH_COLOR = {
  exact: "success",
  normalized: "warning",
  none: "error",
} as const;

interface SourceQuoteCellProps {
  row: ExtractedValueRow;
}

/**
 * The provenance column: what the document actually said, and how well it was
 * matched. A value with no quote is the one a reviewer should distrust most.
 */
export default function SourceQuoteCell({ row }: SourceQuoteCellProps) {
  if (!row.llm_quote) {
    return (
      <Typography
        variant="caption"
        color="text.disabled"
        sx={{ fontStyle: "italic" }}
      >
        No quote
      </Typography>
    );
  }

  return (
    <Box sx={{ minWidth: 0 }}>
      <Tooltip title={row.llm_quote}>
        <Typography variant="caption" noWrap sx={{ display: "block" }}>
          “{row.llm_quote}”
        </Typography>
      </Tooltip>

      <Box
        sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5 }}
      >
        {row.match_kind && (
          <Chip
            label={row.match_kind}
            size="small"
            variant="outlined"
            color={MATCH_COLOR[row.match_kind]}
            sx={{ height: 18, fontSize: 11 }}
          />
        )}
        <Typography variant="caption" color="text.secondary">
          {formatConfidence(row.confidence)}
          {row.source_page !== null && ` · p.${row.source_page}`}
        </Typography>
      </Box>
    </Box>
  );
}
