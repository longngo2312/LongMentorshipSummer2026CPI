import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { SchemaDetail } from "../../types";

function parseEnumOptions(raw: unknown): string {
  if (!raw) return "—";
  if (Array.isArray(raw)) return raw.join(", ");
  try {
    const parsed = JSON.parse(raw as string);
    return Array.isArray(parsed) ? parsed.join(", ") : String(raw);
  } catch {
    return String(raw);
  }
}

interface RenderSchemaGridProps {
  schema: SchemaDetail;
  onEdit: () => void;
}

export default function RenderSchemaGrid({ schema, onEdit }: RenderSchemaGridProps) {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/schemas")}
        sx={{ mb: 2 }}
      >
        Back to Schemas
      </Button>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "flex-start" },
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            {schema.name}
          </Typography>
          {schema.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              {schema.description}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            Created {new Date(schema.created_at).toLocaleDateString()}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={onEdit}
          sx={{ flexShrink: 0 }}
        >
          Edit Schema
        </Button>
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Columns ({schema.schemaColumns.length})
      </Typography>

      {schema.schemaColumns.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No columns defined.</Typography>
        </Paper>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small" sx={{ minWidth: 500 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Required</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Enum Options</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schema.schemaColumns.map((col) => (
                  <TableRow key={col.id}>
                    <TableCell>{col.name}</TableCell>
                    <TableCell>
                      <Chip label={col.data_type} size="small" />
                    </TableCell>
                    <TableCell>{col.required ? "Yes" : "—"}</TableCell>
                    <TableCell>{col.description || "—"}</TableCell>
                    <TableCell>{parseEnumOptions(col.enum_options)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Container>
  );
}
