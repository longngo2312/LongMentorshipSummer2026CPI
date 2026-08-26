import { create } from "zustand";
import { getExtractedDocumentValue } from "../api/documents";
import type { ExtractedDocument } from "../types";

interface ExtractedDocumentState {
  document: ExtractedDocument | null;
  loading: boolean;
  fetchExtractedDocument: (id: number) => void;
}
export const useExtractedDocumentStore = create<ExtractedDocumentState>(
  (set) => ({
    document: null,
    loading: false,
    fetchExtractedDocument: async (id) => {
      set({ loading: true });
      try {
        const data = await getExtractedDocumentValue(id);
        set({ document: data });
      } catch (error) {
        console.log(error);
      } finally {
        set({ loading: false });
      }
    },
  }),
);
