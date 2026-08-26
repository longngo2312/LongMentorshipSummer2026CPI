import {
  Box,
  Button,
  Chip,
  TableCell,
  TableRow,
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
  // Edit mode is transient presentation state, so it stays with the row rather
  // than being lifted into the page beside the data.
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const status = projectStatus(field, pendingValue);
  const pending = pendingValue !== undefined;

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
    <TableRow hover selected={active}>
      <TableCell sx={{ maxWidth: 180 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
          {field.name}
        </Typography>
        <Chip
          label={field.data_type}
          size="small"
          variant="outlined"
          sx={{ height: 18, fontSize: 11, mt: 0.5 }}
        />
      </TableCell>

      <TableCell sx={{ maxWidth: 240 }}>
        {editing ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <TextField
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              size="small"
              autoFocus
              fullWidth
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button size="small" variant="contained" onClick={saveEdit}>
                Save
              </Button>
              <Button size="small" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          // llm_value is the frozen model answer and the only record of what was
          // actually said once a human edits the working value.
          <Tooltip title={`Model answered: ${field.llm_value ?? "null"}`}>
            <Box sx={{ display: "inline-block" }}>
              <ExtractedValueCell field={field} pendingValue={pendingValue} />
            </Box>
          </Tooltip>
        )}
      </TableCell>

      <TableCell sx={{ maxWidth: 220 }}>
        <SourceQuoteCell
          field={field}
          active={active}
          onQuoteClick={onQuoteClick}
        />
      </TableCell>

      <TableCell>
        <ReviewStatusChip status={status} pending={pending} />
      </TableCell>

      <TableCell align="right">
        <ReviewActions
          status={status}
          // Accepting submits llm_value, NOT the displayed value_text. The server
          // marks a field accepted only when the submitted string equals
          // llm_value, and coerce() has already stripped the model's decoration
          // from value_text — "{$12,480.50}" vs "$12,480.50". Sending what is on
          // screen would come back as "edited" for every number and enum.
          onAccept={() => onSetValue(field.column_id, field.llm_value)}
          onEdit={startEdit}
          onReject={() => onSetValue(field.column_id, null)}
        />
      </TableCell>
    </TableRow>
  );
}
