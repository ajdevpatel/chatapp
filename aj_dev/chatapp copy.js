const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Accept from anywhere for now
    methods: ["GET", "POST"]
  }
});


app.post("/broadcast", (req, res) => {
  const data = req.body;
  const room = `group_${data.group_id}`;

  io.to(room).emit("receiveMessage", data);
  console.log(`📡 Laravel triggered broadcast to ${room}`);
  res.send({ status: "broadcasted" });
});


io.on("connection", (socket) => {
  console.log("🚀 New user connected:", socket.id);

  // ✅ Join room (group)
  socket.on("joinRoom", (groupId) => {
    socket.join(`group_${groupId}`);
    console.log(`🧑 Joined group_${groupId}`);
  });

  // ✅ Laravel or client emits newMessage → broadcast to group
  socket.on("newMessage", (data) => {
    io.to(`group_${data.group_id}`).emit("receiveMessage", data);
    console.log("📤 Sent message to group:", data.group_id);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });

});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ Socket.IO Server running on http://localhost:${PORT}`);
});
