import { Box, Button, Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import RenderSchemas from "../components/schema/RenderSchemas";
import SchemaBuilder from "../components/schema/SchemaBuilder";
import { useSchemaStore } from "../stores/schemaStore";
import type { DocumentSchema } from "../types";

export default function SchemaBuilderPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
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
          flexWrap: "wrap",
          gap: 2,
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

      <RenderSchemas schemas={schemaArray} onDelete={deleteSchema} />

      <SchemaBuilder
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={fetchSchema}
      />
    </Container>
  );
}
