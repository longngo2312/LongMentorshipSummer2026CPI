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
import type { ExtractedValueRow } from "../../types";
import ExtractedValueRowItem from "./ExtractedValueRowItem";

const HIDE_ON_MOBILE = { display: { xs: "none", md: "table-cell" } };

interface ExtractedValuesTableProps {
  values: ExtractedValueRow[];
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onSaveEdit: (id: number, value: string) => void;
}

export default function ExtractedValuesTable({
  values,
  onAccept,
  onReject,
  onSaveEdit,
}: ExtractedValuesTableProps) {
  if (values.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 6, textAlign: "center" }}>
        <Typography color="text.secondary">
          Nothing extracted for this document.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ overflowX: "auto" }}>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small" sx={{ minWidth: 640 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Field</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Value</TableCell>
              <TableCell sx={{ fontWeight: 700, ...HIDE_ON_MOBILE }}>
                Source
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Review</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                {/* actions */}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {values.map((row) => (
              <ExtractedValueRowItem
                key={row.id}
                row={row}
                onAccept={onAccept}
                onReject={onReject}
                onSaveEdit={onSaveEdit}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
