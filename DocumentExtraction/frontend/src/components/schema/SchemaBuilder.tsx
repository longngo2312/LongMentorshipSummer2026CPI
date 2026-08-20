import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { updateSchema } from "../../api/schema";
import { useSchemaStore } from "../../stores/schemaStore";
import type { ColumnDataType, SchemaColumn } from "../../types";

export interface ColumnDraft {
  name: string;
  description: string;
  data_type: ColumnDataType;
  enum_options: string;
  required: boolean;
}

interface SchemaBuilderProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schemaId?: number;
  initialData?: {
    name: string;
    description: string;
    columns: SchemaColumn[];
  };
}

const emptyColumn: ColumnDraft = {
  name: "",
  description: "",
  data_type: "text",
  enum_options: "",
  required: false,
};

const DATA_TYPES: ColumnDataType[] = [
  "text",
  "number",
  "date",
  "boolean",
  "enum",
];

function toColumnDraft(col: SchemaColumn): ColumnDraft {
  let enumStr = "";
  if (col.enum_options) {
    if (Array.isArray(col.enum_options)) {
      enumStr = col.enum_options.join(", ");
    } else {
      try {
        enumStr = (
          JSON.parse(col.enum_options as unknown as string) as string[]
        ).join(", ");
      } catch {
        enumStr = "";
      }
    }
  }
  return {
    name: col.name,
    description: col.description ?? "",
    data_type: col.data_type,
    enum_options: enumStr,
    required: Boolean(col.required),
  };
}

export default function SchemaBuilder({
  open,
  onClose,
  onSuccess,
  schemaId,
  initialData,
}: SchemaBuilderProps) {
  const addSchema = useSchemaStore((s) => s.addSchema);
  const isEditMode = schemaId !== undefined;

  const [schemaName, setSchemaName] = useState("");
  const [schemaDescription, setSchemaDescription] = useState("");
  const [columns, setColumns] = useState<ColumnDraft[]>([{ ...emptyColumn }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastColumnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setSchemaName(initialData.name);
      setSchemaDescription(initialData.description);
      setColumns(
        initialData.columns.length > 0
          ? initialData.columns.map(toColumnDraft)
          : [{ ...emptyColumn }],
      );
    } else {
      setSchemaName("");
      setSchemaDescription("");
      setColumns([{ ...emptyColumn }]);
    }
    setError("");
  }, [open]);

  function resetForm() {
    setSchemaName("");
    setSchemaDescription("");
    setColumns([{ ...emptyColumn }]);
    setError("");
  }

  function handleClose() {
    resetForm();
    onClose();
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
      if (isEditMode) {
        await updateSchema(schemaId, {
          name: schemaName,
          description: schemaDescription,
          columns: payload,
        });
      } else {
        await addSchema(schemaName, schemaDescription, payload);
      }
      handleClose();
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEditMode
            ? "Failed to update schema"
            : "Failed to create schema",
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
    // scroll to new column after React renders it
    setTimeout(() => {
      lastColumnRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      lastColumnRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    }, 50);
  }

  function removeColumn(index: number) {
    setColumns((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 560 },
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      {/* Header */}
      <Box sx={{ px: 3, pt: 2, flexShrink: 0 }}>
        <Button
          variant="text"
          onClick={handleClose}
          startIcon={<ArrowBackIcon />}
        >
          Back
        </Button>
        <Typography variant="h6" sx={{ fontWeight: "bold", mt: 1 }}>
          {isEditMode ? "Edit Schema" : "New Schema"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Define the fields you want extracted from your documents.
        </Typography>
      </Box>

      {/* Scrollable form body */}
      <Box ref={scrollRef} sx={{ flexGrow: 1, overflowY: "auto", px: 3 }}>
        <Stack spacing={5}>
          <TextField
            label="Schema Name"
            value={schemaName}
            onChange={(e) => setSchemaName(e.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            label="Description"
            value={schemaDescription}
            onChange={(e) => setSchemaDescription(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 1,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Columns
            </Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={addColumn}>
              Add Column
            </Button>
          </Box>

          {columns.map((col, index) => (
            <Paper
              key={index}
              variant="outlined"
              sx={{ p: 2 }}
              ref={index === columns.length - 1 ? lastColumnRef : null}
            >
              <Stack spacing={2}>
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
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
                    sx={{ minWidth: 140 }}
                  >
                    {DATA_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                  <IconButton
                    onClick={() => removeColumn(index)}
                    disabled={columns.length === 1}
                    aria-label="Remove column"
                    sx={{ flexShrink: 0 }}
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
      </Box>

      {/* Footer */}
      <Box sx={{ px: 3, pb: 3, flexShrink: 0 }}>
        <Divider sx={{ mb: 2 }} />
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Schema"}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
