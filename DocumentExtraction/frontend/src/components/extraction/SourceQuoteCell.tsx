import FindInPageIcon from "@mui/icons-material/FindInPage";
import { Box, Button, Chip, Tooltip, Typography } from "@mui/material";
import type { ReviewField } from "../../types";
import { formatConfidence, hasLocatableQuote } from "../../utils/extractedValue";

const MATCH_COLOR = {
  exact: "success",
  normalized: "warning",
  none: "error",
} as const;

interface SourceQuoteCellProps {
  field: ReviewField;
  active: boolean;
  onQuoteClick: (field: ReviewField) => void;
}

/**
 * The provenance cell, and the entry point to the document panel.
 *
 * A quote the server could not place (match_kind "none") is deliberately not
 * clickable — the model invented it, and sending the reviewer to a page where it
 * does not appear is worse than saying so.
 */
export default function SourceQuoteCell({
  field,
  active,
  onQuoteClick,
}: SourceQuoteCellProps) {
  if (!field.llm_quote) {
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

  if (!hasLocatableQuote(field)) {
    return (
      <Tooltip title={field.llm_quote}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.disabled" noWrap sx={{ display: "block" }}>
            “{field.llm_quote}”
          </Typography>
          <Chip
            label="not in document"
            size="small"
            variant="outlined"
            color="error"
            sx={{ height: 18, fontSize: 11, mt: 0.5 }}
          />
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box sx={{ minWidth: 0 }}>
      <Tooltip title={field.llm_quote}>
        <Button
          size="small"
          startIcon={<FindInPageIcon fontSize="small" />}
          onClick={() => onQuoteClick(field)}
          variant={active ? "contained" : "text"}
          sx={{
            textTransform: "none",
            justifyContent: "flex-start",
            maxWidth: "100%",
            py: 0,
          }}
        >
          <Typography variant="caption" noWrap>
            “{field.llm_quote}”
          </Typography>
        </Button>
      </Tooltip>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.25, pl: 1 }}>
        {field.match_kind && (
          <Chip
            label={field.match_kind}
            size="small"
            variant="outlined"
            color={MATCH_COLOR[field.match_kind]}
            sx={{ height: 18, fontSize: 11 }}
          />
        )}
        <Typography variant="caption" color="text.secondary">
          {formatConfidence(field.confidence)}
          {field.source_page !== null && ` · p.${field.source_page}`}
        </Typography>
      </Box>
    </Box>
  );
}
