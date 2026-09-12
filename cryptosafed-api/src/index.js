import express from "express";
import cors from "cors";
import config from "./config/index.js";
import analyzeRouter from "./routes/analyze.js";
import { initComplianceKB } from "./services/complianceKB.js";

const app = express();

const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "cryptosafed-api" });
});

app.use("/analyze", analyzeRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

async function startServer() {
  await initComplianceKB();

  app.listen(config.port, () => {
    console.log(`cryptosafed-api running on port ${config.port}`);
  });
}

startServer();
