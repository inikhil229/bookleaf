import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import http from "node:http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import authRoutes from "./routes/auth.routes.js";
import bookRoutes from "./routes/book.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import { connectDb } from "./DB/connction.js";
import { setUpSocket } from "./socket/socket.js";

const allowedOrigins = (
  process.env.CLIENT_ORIGIN || "http://localhost:5173,http://localhost:5174"
)
  .split(",")
  .map((x) => x.trim());

const PORT = process.env.PORT || 3000;

const app = express();

const server = http.createServer(app);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);



app.use(helmet());

app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

app.use(
  "/api/auth",
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }),
  authRoutes,
);
app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", msg: "server running on port 3000" }),
);

app.get("/api/docs", (_req, res) =>
  res.json({
    auth: [
      "POST /api/auth/register",
      "POST /api/auth/login",
      "POST /api/auth/logout",
      "GET /api/auth/me",
    ],
    books: ["GET /api/books"],
    tickets: [
      "GET /api/tickets",
      "POST /api/tickets",
      "GET /api/tickets/:id",
      "PATCH /api/tickets/:id",
      "POST /api/tickets/:id/replies",
      "POST /api/tickets/:id/draft",
    ],
  }),
);

app.use("/api/books", bookRoutes);
app.use("/api/tickets", ticketRoutes);
app.use((req, res) =>
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.path}` }),
);
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === "ValidationError")
    return res.status(400).json({
      message: "Validation failed",
      details: Object.values(err.errors).map((e) => e.message),
    });
  if (err.name === "CastError")
    return res.status(400).json({ message: "Invalid resource id" });
  res
    .status(err.status || 500)
    .json({ message: err.message || "Unexpected server error" });
});


setUpSocket(server)

connectDb(process.env.DB_URI).then(() => {
  console.log("db connected");
  httpServer.listen(PORT, () => {
    console.log("app running on port http://localhost:" + PORT);
  });
});
