import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SchemaBuilder from "../components/SchemaBuilder";
import { useSchemaStore } from "../stores/schemaStore";
import type { DocumentSchema } from "../types";

export default function SchemaBuilderPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const fetchSchema = useSchemaStore((s) => s.fetchSchema);
  const schemaArray = useSchemaStore((s) => s.schemas) as DocumentSchema[];
  const deleteSchema = useSchemaStore((s) => s.removeSchema);

  useEffect(() => {
    fetchSchema();
  }, []);

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
              onClick={() => {
                navigate(`/schemas/${schema.id}`);
              }}
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

      <SchemaBuilder
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={fetchSchema}
      />
    </Container>
  );
}
