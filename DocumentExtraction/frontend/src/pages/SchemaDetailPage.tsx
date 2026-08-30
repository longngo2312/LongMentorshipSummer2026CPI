import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Alert, Box, Button, CircularProgress, Container } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSchema } from "../api/schema";
import RenderSchemaGrid from "../components/schema/RenderSchemaGrid";
import SchemaBuilder from "../components/schema/SchemaBuilder";
import type { SchemaDetail } from "../types";

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
      .then((data) => setSchemaDetail(data))
      .catch((err) =>
        setFetchError(
          err instanceof Error ? err.message : "Failed to load schema",
        ),
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
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/schemas")}
        >
          Back to Schemas
        </Button>
      </Container>
    );
  }

  return (
    <>
      <RenderSchemaGrid
        schema={schemaDetail}
        onEdit={() => setDrawerOpen(true)}
      />
      <SchemaBuilder
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={() =>
          getSchema(schemaId).then((data) => setSchemaDetail(data))
        }
        schemaId={schemaId}
        initialData={{
          name: schemaDetail.name,
          description: schemaDetail.description ?? "",
          columns: schemaDetail.schemaColumns,
        }}
      />
    </>
  );
}
