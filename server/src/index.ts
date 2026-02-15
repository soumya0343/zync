import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

import authRoutes from "./routes/authRoutes";
import boardRoutes from "./routes/boardRoutes";
import taskRoutes from "./routes/taskRoutes";
import goalRoutes from "./routes/goalRoutes";
import checkInRoutes from "./routes/checkInRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";

app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/checkins", checkInRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
