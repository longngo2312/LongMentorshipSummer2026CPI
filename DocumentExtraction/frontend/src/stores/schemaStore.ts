import { create } from "zustand";
import {
  createDocumentSchema,
  deleteSchema,
  getAllSchemas,
} from "../api/schema";
interface SchemaState {
  schemas: unknown[];
  loading: boolean;
  fetchSchema: () => Promise<void>;
  removeSchema: (id: number) => Promise<void>;
  addSchema: (
    name: string,
    description: string,
    columns: unknown[],
  ) => Promise<void>;
}

export const useSchemaStore = create<SchemaState>((set) => ({
  schemas: [],
  loading: false,
  fetchSchema: async () => {
    set({ loading: true });
    try {
      const schema = await getAllSchemas();
      set({ schemas: schema });
    } catch (error) {
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },
  removeSchema: async (id) => {
    await deleteSchema(id);
    set((state) => ({
      schemas: state.schemas.filter((data: any) => data.id !== id),
    }));
  },

  addSchema: async (name, description, columns) => {
    set({ loading: true });
    try {
      const newSchema = await createDocumentSchema(name, description, columns);
      set((state) => ({
        schemas: [newSchema, ...state.schemas],
      }));
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
