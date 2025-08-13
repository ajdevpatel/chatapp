// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static client files from 'public'
app.use(express.static(path.join(__dirname, "public")));

const userSocketMap = new Map(); // userId -> socket.id

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("register", (userId) => {
    if (!userId) return;
    userSocketMap.set(userId, socket.id);
    socket.data.userId = userId;
    console.log(`Registered userId=${userId} -> socket=${socket.id}`);
    // send back current map for debug (optional)
    io.to(socket.id).emit("registered", { ok: true });
  });

  socket.on("offer", ({ to, offer, from }) => {
    const toSocket = userSocketMap.get(to);
    if (toSocket) {
      io.to(toSocket).emit("offer", { from, offer });
      console.log(`Offer from ${from} -> ${to}`);
    } else {
      io.to(socket.id).emit("unavailable", { to });
      console.log(`Offer failed: ${to} not found`);
    }
  });

  socket.on("answer", ({ to, answer, from }) => {
    const toSocket = userSocketMap.get(to);
    if (toSocket) {
      io.to(toSocket).emit("answer", { from, answer });
      console.log(`Answer from ${from} -> ${to}`);
    }
  });

  socket.on("ice-candidate", ({ to, candidate, from }) => {
    const toSocket = userSocketMap.get(to);
    if (toSocket) {
      io.to(toSocket).emit("ice-candidate", { from, candidate });
    }
  });

  socket.on("disconnect", () => {
    const uid = socket.data.userId;
    if (uid) {
      userSocketMap.delete(uid);
      console.log(`User ${uid} disconnected and removed`);
    }
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
