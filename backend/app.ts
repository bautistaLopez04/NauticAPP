import express from "express";
import cors from "cors";
import variablesRouter from "./routes/variables";
import spotsRouter from "./routes/spots";

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/variables", variablesRouter);
app.use("/api/spots", spotsRouter);

export default app;
