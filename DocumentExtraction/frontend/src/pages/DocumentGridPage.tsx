import { Box, Container, Typography } from "@mui/material";
import { useEffect } from "react";
import RenderDocuments from "../components/RenderDocuments";
import { useDocumentStore } from "../stores/documentStore";
export default function DocumentGridPage() {
  const documents = useDocumentStore((s) => s.documents);
  const fetchDocuments = useDocumentStore((s) => s.fetchDocuments);
  const removeDocument = useDocumentStore((s) => s.removeDocument);
  useEffect(() => {
    fetchDocuments();
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
          Documents
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {documents.length} total
        </Typography>
      </Box>

      {/* TODO(wiring): swap in the loading / error branches around this. */}
      <RenderDocuments
        documents={documents}
        onDelete={(document) => removeDocument(document.id)}
      />
    </Container>
  );
}
