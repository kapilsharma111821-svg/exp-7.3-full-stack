// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// allow socket connections from React (http://localhost:3000)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// simple health route
app.get("/", (req, res) => res.send("Socket.IO chat server running"));

// socket logic
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // handle join with username (optional)
  socket.on("join", (username) => {
    socket.username = username || "Anonymous";
    console.log(`${socket.username} joined (${socket.id})`);
  });

  // receiving a chat message from a client
  // payload: { name, message, time }
  socket.on("chatMessage", (payload) => {
    // broadcast to ALL clients including sender
    io.emit("chatMessage", payload);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
