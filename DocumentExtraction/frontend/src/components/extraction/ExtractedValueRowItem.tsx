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
import type { ExtractedValueRow } from "../../types";
import { displayValue } from "../../utils/extractedValue";
import ExtractedValueCell from "./ExtractedValueCell";
import ReviewActions from "./ReviewActions";
import ReviewStatusChip from "./ReviewStatusChip";
import SourceQuoteCell from "./SourceQuoteCell";

// Provenance is the first thing to go on a narrow screen — the value and the
// verdict are what a reviewer cannot work without.
const HIDE_ON_MOBILE = { display: { xs: "none", md: "table-cell" } };

interface ExtractedValueRowItemProps {
  row: ExtractedValueRow;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onSaveEdit: (id: number, value: string) => void;
}

export default function ExtractedValueRowItem({
  row,
  onAccept,
  onReject,
  onSaveEdit,
}: ExtractedValueRowItemProps) {
  // Edit mode is transient presentation state, so it stays with the row rather
  // than being lifted into the page alongside the data.
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  function startEdit() {
    setDraft(displayValue(row) ?? "");
    setEditing(true);
  }

  function saveEdit() {
    onSaveEdit(row.id, draft);
    setEditing(false);
  }

  return (
    <TableRow hover>
      <TableCell sx={{ maxWidth: 200 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
          {row.column_name}
        </Typography>
        <Chip
          label={row.data_type}
          size="small"
          variant="outlined"
          sx={{ height: 18, fontSize: 11, mt: 0.5 }}
        />
      </TableCell>

      <TableCell sx={{ maxWidth: 260 }}>
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
          // llm_value is frozen at extraction time and is the only record of
          // what the model said once a human edits the working value — worth
          // surfacing, but not worth a column of its own.
          <Tooltip title={`Model answered: ${row.llm_value ?? "null"}`}>
            <Box sx={{ display: "inline-block" }}>
              <ExtractedValueCell row={row} />
            </Box>
          </Tooltip>
        )}
      </TableCell>

      <TableCell sx={{ maxWidth: 240, ...HIDE_ON_MOBILE }}>
        <SourceQuoteCell row={row} />
      </TableCell>

      <TableCell>
        <ReviewStatusChip status={row.review_status} />
      </TableCell>

      <TableCell align="right">
        <ReviewActions
          status={row.review_status}
          onAccept={() => onAccept(row.id)}
          onEdit={startEdit}
          onReject={() => onReject(row.id)}
        />
      </TableCell>
    </TableRow>
  );
}
