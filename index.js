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
        origin: "*",
        methods: ["GET", "POST"]
    }
});


io.on("connection", (socket) => {
    console.log("✅ New client connected:", socket.id);

    socket.on("join_deal", ({ deal_id, user_id }) => {
        if (!deal_id || !user_id) return;
        socket.join(`deal_${deal_id}`);
        console.log(`👤 User ${user_id} joined deal_${deal_id}`);
    });

    socket.on("deal_chat_send", (data) => {
        const { deal_id } = data;
        if (!deal_id) return;
        socket.to(`deal_${deal_id}`).emit("deal_chat_receive", data);
        console.log(`📨 Message sent to deal_${deal_id}`);
    });

    socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
    });

});


const PORT = process.env.PORT || 443;
server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
