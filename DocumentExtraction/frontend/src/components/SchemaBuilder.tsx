import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
import type { ColumnDataType } from "../types";

export interface ColumnDraft {
  name: string;
  description: string;
  data_type: ColumnDataType;
  enum_options: string;
  required: boolean;
}

interface SchemaBuilderProps {
  schemaName: string;
  setSchemaName: (v: string) => void;
  schemaDescription: string;
  setSchemaDescription: (v: string) => void;
  columns: ColumnDraft[];
  updateColumn: (index: number, patch: Partial<ColumnDraft>) => void;
  addColumn: () => void;
  removeColumn: (index: number) => void;
  error: string;
  loading: boolean;
  handleSubmit: () => void;
  onClose: () => void;
}

const dataTypes: ColumnDataType[] = [
  "text",
  "number",
  "date",
  "boolean",
  "enum",
];

export default function SchemaBuilder({
  schemaName,
  setSchemaName,
  schemaDescription,
  setSchemaDescription,
  columns,
  updateColumn,
  addColumn,
  removeColumn,
  error,
  loading,
  handleSubmit,
  onClose,
}: SchemaBuilderProps) {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        variant="text"
        onClick={onClose}
        startIcon={<ArrowBackIcon />}
      >
        Back
      </Button>
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
