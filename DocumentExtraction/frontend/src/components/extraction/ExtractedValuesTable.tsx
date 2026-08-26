import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { ReviewField } from "../../types";
import ExtractedValueRowItem from "./ExtractedValueRowItem";

interface ExtractedValuesTableProps {
  fields: ReviewField[];
  edits: Map<number, string | null>;
  activeColumnId: number | null;
  onQuoteClick: (field: ReviewField) => void;
  onSetValue: (columnId: number, value: string | null) => void;
}

export default function ExtractedValuesTable({
  fields,
  edits,
  activeColumnId,
  onQuoteClick,
  onSetValue,
}: ExtractedValuesTableProps) {
  if (fields.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 6, textAlign: "center" }}>
        <Typography color="text.secondary">
          Nothing extracted for this document yet.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ overflowX: "auto" }}>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small" sx={{ minWidth: 620 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Field</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Value</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Source</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Review</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                {/* actions */}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {fields.map((field) => (
              <ExtractedValueRowItem
                key={field.column_id}
                field={field}
                pendingValue={
                  edits.has(field.column_id)
                    ? edits.get(field.column_id)
                    : undefined
                }
                active={activeColumnId === field.column_id}
                onQuoteClick={onQuoteClick}
                onSetValue={onSetValue}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
