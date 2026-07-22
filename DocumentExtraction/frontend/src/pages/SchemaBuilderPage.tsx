import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSchemaStore } from "../stores/schemaStore";
import type { ColumnDataType } from "../types";

interface ColumnDraft {
  name: string;
  description: string;
  data_type: ColumnDataType;
  enum_options: string;
  required: boolean;
}

const emptyColumn: ColumnDraft = {
  name: "",
  description: "",
  data_type: "text",
  enum_options: "",
  required: false,
};

const dataTypes: ColumnDataType[] = [
  "text",
  "number",
  "date",
  "boolean",
  "enum",
];

export default function SchemaBuilderPage() {
  const [schemaName, setSchemaName] = useState("");
  const [schemaDescription, setSchemaDescription] = useState("");
  const [columns, setColumns] = useState<ColumnDraft[]>([{ ...emptyColumn }]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const addSchema = useSchemaStore((s) => s.addSchema);

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
      navigate("/schemas");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Fail to create schema",
      );
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
      <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
        Schema Builder
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Define the fields you want extracted from your documents.
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <TextField
            label="Schema Name"
            value={schemaName}
            onChange={(e) => setSchemaName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Description"
            value={schemaDescription}
            onChange={(e) => setSchemaDescription(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h6">Columns</Typography>
        <Button startIcon={<AddIcon />} onClick={addColumn}>
          Add Column
        </Button>
      </Box>

      <Stack spacing={2}>
        {columns.map((col, index) => (
          <Paper key={index} variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Column Name"
                  value={col.name}
                  onChange={(e) =>
                    updateColumn(index, { name: e.target.value })
                  }
                  fullWidth
                />
                <TextField
                  label="Data Type"
                  select
                  value={col.data_type}
                  onChange={(e) =>
                    updateColumn(index, {
                      data_type: e.target.value as ColumnDataType,
                    })
                  }
                  sx={{ minWidth: 160 }}
                >
                  {dataTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
                <IconButton
                  onClick={() => removeColumn(index)}
                  disabled={columns.length === 1}
                  aria-label="Remove column"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>

              <TextField
                label="Description"
                value={col.description}
                onChange={(e) =>
                  updateColumn(index, { description: e.target.value })
                }
                fullWidth
              />

              {col.data_type === "enum" && (
                <TextField
                  label="Enum Options (comma separated)"
                  value={col.enum_options}
                  onChange={(e) =>
                    updateColumn(index, { enum_options: e.target.value })
                  }
                  fullWidth
                />
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    checked={col.required}
                    onChange={(e) =>
                      updateColumn(index, { required: e.target.checked })
                    }
                  />
                }
                label="Required"
              />
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Divider sx={{ my: 3 }} />

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" size="large" onClick={handleSubmit}>
          {loading ? "Saving..." : "Save Schema"}
        </Button>
      </Box>
    </Container>
  );
}
