import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import connectDb from "./configs/db.js";
import authRouter from "./routes/authRoute.js";
import liveRouter from "./routes/liveRoute.js";
import userRouter from "./routes/userRoute.js";
import courseRouter from "./routes/courseRoute.js";
import paymentRouter from "./routes/paymentRoute.js";
import aiRouter from "./routes/aiRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import adminRouter from "./routes/adminRoute.js";
import videoRouter from "./routes/videoRoute.js";
import notesRouter from "./routes/notesRoute.js"; // Notes route

dotenv.config();

const port = process.env.PORT || 8000;
const app = express();

// -------------------------------
// ✅ Allowed Frontend URLs
// -------------------------------
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const FRONTEND_URL_2 = process.env.FRONTEND_URL_2 || "http://localhost:5175";
const PROD_URL = process.env.PROD_URL || "https://techsproutlms.com";
const API_SELF = process.env.API_SELF || `http://localhost:${port}`;

// -------------------------------
// 🔥 FINAL CORS WHITELIST (FIXED)
// -------------------------------
const allowedOrigins = [
  FRONTEND_URL,
  FRONTEND_URL_2,
  API_SELF,
  PROD_URL,
  "https://techsproutlms.com",  // Always allow production domain
  "http://techsproutlms.com",
].filter(Boolean);

// -------------------------------
// ✅ Setup server + socket.io
// -------------------------------
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

// -------------------------------
// ✅ Middleware
// -------------------------------
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow mobile apps, curl, etc.
      if (allowedOrigins.includes(origin)) return callback(null, true);

      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error("CORS not allowed from origin: " + origin), false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// -------------------------------
// ✅ API Routes
// -------------------------------
app.use("/api/auth", authRouter);
app.use("/api/live", liveRouter);
app.use("/api/user", userRouter);
app.use("/api/course", courseRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/ai", aiRouter);
app.use("/api/review", reviewRouter);
app.use("/api/admin", adminRouter);
app.use("/api/videos", videoRouter);
app.use("/api/notes", notesRouter);

// -------------------------------
// ✅ Health Check
// -------------------------------
app.get("/", (req, res) => {
  res.send("✅ Server running successfully!");
});

// -------------------------------
// ✅ WebSocket Events
// -------------------------------
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", socket.id);
  });

  socket.on("offer", (data) => {
    socket.to(data.roomId).emit("offer", {
      offer: data.offer,
      sender: socket.id,
    });
  });

  socket.on("answer", (data) => {
    socket.to(data.roomId).emit("answer", {
      answer: data.answer,
      sender: socket.id,
    });
  });

  socket.on("ice-candidate", (data) => {
    socket.to(data.roomId).emit("ice-candidate", {
      candidate: data.candidate,
      sender: socket.id,
    });
  });

  socket.on("send-message", (data) => {
    socket.to(data.roomId).emit("receive-message", {
      message: data.message,
      sender: socket.id,
      timestamp: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// -------------------------------
// ✅ Start Server
// -------------------------------
httpServer.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  connectDb();
});

