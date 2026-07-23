import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSchema } from "../api/schema";
import SchemaBuilder from "../components/SchemaBuilder";
import type { SchemaDetail } from "../types";

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

export default function SchemaDetailPage() {
  const { id } = useParams();
  const schemaId = Number(id);
  const navigate = useNavigate();
  const [schemaDetail, setSchemaDetail] = useState<SchemaDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setFetchError(null);
    getSchema(schemaId)
      .then(setSchemaDetail)
      .catch((err) =>
        setFetchError(err instanceof Error ? err.message : "Failed to load schema"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (fetchError || !schemaDetail) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {fetchError ?? "Schema not found"}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/schemas")}>
          Back to Schemas
        </Button>
      </Container>
    );
  }

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
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            {schemaDetail.name}
          </Typography>
          {schemaDetail.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              {schemaDetail.description}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            Created {new Date(schemaDetail.created_at).toLocaleDateString()}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => setDrawerOpen(true)}
        >
          Edit Schema
        </Button>
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Columns ({schemaDetail.schemaColumns.length})
      </Typography>

      {schemaDetail.schemaColumns.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No columns defined.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
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
              {schemaDetail.schemaColumns.map((col) => (
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
      )}

      <SchemaBuilder
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={() => {
          getSchema(schemaId).then(setSchemaDetail);
        }}
        schemaId={schemaId}
        initialData={{
          name: schemaDetail.name,
          description: schemaDetail.description ?? "",
          columns: schemaDetail.schemaColumns,
        }}
      />
    </Container>
  );
}
