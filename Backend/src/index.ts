import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRouter from "./routes/index";
import { errorHandler } from "./middleware/errorHandler";
import logger from "./utils/logger";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

app.use("/api", apiRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
  });
}

export default app;
