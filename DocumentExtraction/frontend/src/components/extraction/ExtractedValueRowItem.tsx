import {
  Box,
  Button,
  Chip,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import type { ReviewField } from "../../types";
import { projectStatus } from "../../utils/extractedValue";
import ExtractedValueCell from "./ExtractedValueCell";
import ReviewActions from "./ReviewActions";
import ReviewStatusChip from "./ReviewStatusChip";
import SourceQuoteCell from "./SourceQuoteCell";

/** Left-border accent color per review status. */
const STATUS_BORDER_COLOR: Record<string, string> = {
  unreviewed: "#E2E8F0",
  accepted: "#059669",
  edited: "#2563EB",
  rejected: "#DC2626",
};

interface ExtractedValueRowItemProps {
  field: ReviewField;
  pendingValue: string | null | undefined;
  active: boolean;
  onQuoteClick: (field: ReviewField) => void;
  onSetValue: (columnId: number, value: string | null) => void;
}

export default function ExtractedValueRowItem({
  field,
  pendingValue,
  active,
  onQuoteClick,
  onSetValue,
}: ExtractedValueRowItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const status = projectStatus(field, pendingValue);
  const pending = pendingValue !== undefined;
  const borderColor = STATUS_BORDER_COLOR[status] ?? "#E2E8F0";

  function startEdit() {
    const current = pendingValue === undefined ? field.value_text : pendingValue;
    setDraft(current ?? "");
    setEditing(true);
  }

  function saveEdit() {
    onSetValue(field.column_id, draft);
    setEditing(false);
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: 1.5,
        overflow: "hidden",
        transition: "all 150ms ease",
        bgcolor: active
          ? "#EFF6FF"
          : pending
            ? "#FFFBEB"
            : "background.paper",
        "&:hover": {
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        },
      }}
    >
      {/* Header row: field name + type + status + actions */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          pt: 1.5,
          pb: 0.75,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            lineHeight: 1.3,
            minWidth: 0,
          }}
          noWrap
        >
          {field.name}
        </Typography>

        <Chip
          label={field.data_type}
          size="small"
          variant="outlined"
          sx={{
            height: 18,
            fontSize: "0.6rem",
            borderColor: "#CBD5E1",
            color: "text.secondary",
            fontWeight: 500,
          }}
        />

        <Box sx={{ flexGrow: 1 }} />

        <ReviewStatusChip status={status} pending={pending} />

        <ReviewActions
          status={status}
          onAccept={() => onSetValue(field.column_id, field.llm_value)}
          onEdit={startEdit}
          onReject={() => onSetValue(field.column_id, null)}
        />
      </Box>

      {/* Body: value + source quote side by side */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          px: 2,
          pb: 1.5,
          alignItems: "flex-start",
        }}
      >
        {/* Value section — takes most space */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontSize: "0.6rem",
              mb: 0.5,
              display: "block",
            }}
          >
            Value
          </Typography>

          {editing ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              <TextField
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                size="small"
                autoFocus
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: "0.8125rem",
                    borderRadius: 1.5,
                  },
                }}
              />
              <Box sx={{ display: "flex", gap: 0.75 }}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={saveEdit}
                  sx={{ fontSize: "0.7rem", py: 0.25, px: 1.5 }}
                >
                  Apply
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setEditing(false)}
                  sx={{ fontSize: "0.7rem", py: 0.25, px: 1.5 }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <Tooltip title={`Model answered: ${field.llm_value ?? "null"}`}>
              <Box sx={{ display: "inline-block" }}>
                <ExtractedValueCell field={field} pendingValue={pendingValue} />
              </Box>
            </Tooltip>
          )}
        </Box>

        {/* Source quote section */}
        <Box sx={{ flexShrink: 0, minWidth: 140, maxWidth: 260 }}>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontSize: "0.6rem",
              mb: 0.5,
              display: "block",
            }}
          >
            Source
          </Typography>

          <SourceQuoteCell
            field={field}
            active={active}
            onQuoteClick={onQuoteClick}
          />
        </Box>
      </Box>
    </Paper>
  );
}
