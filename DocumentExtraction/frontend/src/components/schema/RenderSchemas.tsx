import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { DocumentSchema } from "../../types";

interface RenderSchemasProps {
  schemas: DocumentSchema[];
  onDelete: (id: number) => void;
}

export default function RenderSchemas({ schemas, onDelete }: RenderSchemasProps) {
  const navigate = useNavigate();

  if (schemas.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 6, textAlign: "center" }}>
        <Typography color="text.secondary">
          No schemas yet. Click <strong>Add Schema</strong> to create one.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={1.5}>
      {schemas.map((schema) => (
        <Paper
          key={schema.id}
          variant="outlined"
          onClick={() => navigate(`/schemas/${schema.id}`)}
          sx={{
            display: "flex",
            alignItems: "center",
            px: 2,
            py: 1.5,
            gap: 1,
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
            label={`${schema.column_count} col${schema.column_count !== 1 ? "s" : ""}`}
            size="small"
            sx={{ flexShrink: 0 }}
          />

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ flexShrink: 0, display: { xs: "none", sm: "block" } }}
          >
            {new Date(schema.created_at).toLocaleDateString()}
          </Typography>

          <IconButton
            size="small"
            color="error"
            sx={{ flexShrink: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(schema.id);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Paper>
      ))}
    </Stack>
  );
}
