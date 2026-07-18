import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.js";
import schemaRoutes from "./routes/schema.js";
const app = express();
const PORT = 3000;

//middleware
app.use(cors({ origin: "https://localhost:5173" }));
app.use(express.json());
//Routes

app.use((req, _res, next) => {
  console.log(req.method, req.url);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/schemas", schemaRoutes);

app.listen(PORT, () => {
  console.log("App listening at PORT", PORT);
});
