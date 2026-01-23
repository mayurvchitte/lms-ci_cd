import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

// -------------------------------
// Import DB & Routes
// -------------------------------
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
import notesRouter from "./routes/notesRoute.js";

// -------------------------------
// Load Environment Variables
// -------------------------------
dotenv.config();

// -------------------------------
// App & Server Setup
// -------------------------------
const app = express();
const port = process.env.PORT || 8000;
const httpServer = http.createServer(app);

// -------------------------------
// Allowed Origins (CORS)
// -------------------------------
const FRONTEND_URL   = process.env.FRONTEND_URL || "http://localhost:5173";
const FRONTEND_URL_2 = process.env.FRONTEND_URL_2 || "http://localhost:5175";
const PROD_URL       = process.env.PROD_URL || "https://example.com";
const API_SELF       = process.env.API_SELF || `http://localhost:${port}`;

const allowedOrigins = [
  FRONTEND_URL,
  FRONTEND_URL_2,
  PROD_URL,
  API_SELF,
  "https://techsproutlms.com",
  "http://techsproutlms.com",
].filter(Boolean);

// -------------------------------
// Socket.IO Setup
// -------------------------------
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

// -------------------------------
// Express Middleware
// -------------------------------
app.set("trust proxy", 1);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman, curl, mobile apps
      if (allowedOrigins.includes(origin)) return callback(null, true);

      console.error("❌ CORS blocked:", origin);
      return callback(
        new Error("CORS not allowed from origin: " + origin),
        false
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// -------------------------------
// API Routes
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
// Health Check
// -------------------------------
app.get("/", (req, res) => {
  res.status(200).send("✅ LMS Backend Server is running!");
});

// -------------------------------
// Socket.IO Events
// -------------------------------
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

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
    console.log("❌ User disconnected:", socket.id);
  });
});

// -------------------------------
// Start Server (Fail-fast DB)
// -------------------------------
connectDb()
  .then(() => {
    httpServer.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });

