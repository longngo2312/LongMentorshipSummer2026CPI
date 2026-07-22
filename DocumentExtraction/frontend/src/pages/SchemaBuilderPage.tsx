import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Chip,
  Container,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import SchemaBuilder, { type ColumnDraft } from "../components/SchemaBuilder";
import { useSchemaStore } from "../stores/schemaStore";
import type { DocumentSchema } from "../types";

const emptyColumn: ColumnDraft = {
  name: "",
  description: "",
  data_type: "text",
  enum_options: "",
  required: false,
};

export default function SchemaBuilderPage() {
  const [schemaName, setSchemaName] = useState("");
  const [schemaDescription, setSchemaDescription] = useState("");
  const [columns, setColumns] = useState<ColumnDraft[]>([{ ...emptyColumn }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const addSchema = useSchemaStore((s) => s.addSchema);
  const fetchSchema = useSchemaStore((s) => s.fetchSchema);
  const schemaArray = useSchemaStore((s) => s.schemas) as DocumentSchema[];
  const deleteSchema = useSchemaStore((s) => s.removeSchema);
  useEffect(() => {
    fetchSchema();
  }, []);

  console.log(schemaArray);
  function resetForm() {
    setSchemaName("");
    setSchemaDescription("");
    setColumns([{ ...emptyColumn }]);
    setError("");
  }

  function closeDrawer() {
    setDrawerOpen(false);
    resetForm();
  }

  async function handleSubmit() {
    if (!schemaName.trim()) {
      setError("Schema name is required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const payload = columns.map((col) => ({
        ...col,
        enum_options:
          col.data_type === "enum"
            ? col.enum_options
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : null,
      }));
      await addSchema(schemaName, schemaDescription, payload);
      await fetchSchema();
      closeDrawer();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create schema");
    } finally {
      setLoading(false);
    }
  }

  function updateColumn(index: number, patch: Partial<ColumnDraft>) {
    setColumns((prev) =>
      prev.map((col, i) => (i === index ? { ...col, ...patch } : col)),
    );
  }

  function addColumn() {
    setColumns((prev) => [...prev, { ...emptyColumn }]);
  }

  function removeColumn(index: number) {
    setColumns((prev) => prev.filter((_, i) => i !== index));
  }
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Schemas
        </Typography>
        <Button variant="contained" onClick={() => setDrawerOpen(true)}>
          Add Schema
        </Button>
      </Box>

      {schemaArray.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: "center" }}>
          <Typography color="text.secondary">
            No schemas yet. Click <strong>Add Schema</strong> to create one.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {schemaArray.map((schema: DocumentSchema) => (
            <Paper
              key={schema.id}
              variant="outlined"
              sx={{
                display: "flex",
                alignItems: "center",
                px: 2,
                py: 1.5,
                "&:hover": { bgcolor: "action.hover" },
                cursor: "pointer",
              }}
            >
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
                  {schema.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {schema.description ?? "—"}
                </Typography>
              </Box>
              <Chip
                label={`${schema.column_count} column${schema.column_count !== 1 ? "s" : ""}`}
                size="small"
                sx={{ mx: 2, flexShrink: 0 }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mr: 1.5, flexShrink: 0 }}
              >
                {new Date(schema.created_at).toLocaleDateString()}
              </Typography>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSchema(schema.id);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Paper>
          ))}
        </Stack>
      )}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        slotProps={{ paper: { sx: { width: { xs: "100%", sm: 560 } } } }}
      >
        <SchemaBuilder
          schemaName={schemaName}
          setSchemaName={setSchemaName}
          schemaDescription={schemaDescription}
          setSchemaDescription={setSchemaDescription}
          columns={columns}
          updateColumn={updateColumn}
          addColumn={addColumn}
          removeColumn={removeColumn}
          error={error}
          loading={loading}
          handleSubmit={handleSubmit}
          onClose={closeDrawer}
        />
      </Drawer>
    </Container>
  );
}
