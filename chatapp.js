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


const PORT = 3001;
server.listen(PORT, () => {
    console.log(`✅ Socket.IO Server running on http://localhost:${PORT}`);
});



/*

let authUsers = {};
let authToken = {};

io.on("connection", (socket) => {
    console.log("✅ Client connected :", socket.id);
    //Done
    socket.on("disconnect", () => {
        for (let userId in authUsers) {
            if (authUsers[userId] === socket.id) {
                delete authUsers[userId];
                delete authToken[userId];
                break;
            }
        }
        console.log("❌ Client disconnected:", socket.id);
    });
    //Done
    socket.on("register_client", ({ token, group_id, user_id }) => {
        socket.join(`group_${group_id}`);
        authToken[user_id] = token;
        authUsers[user_id] = socket.id;
        console.log(`User ${user_id} register with socket ${socket.id}`);
    });


   

    
    // When message is sent
    socket.on("send_message", (data) => {
        const { group_id, user_id, message } = data;
        if (!group_id || !user_id || !message) return;

        console.log(`📨 Message from ${user_id} to group_${group_id}: ${message}`);

        socket.to(`group_${group_id}`).emit("receive_message", {
            group_id,
            user_id,
            message
        });

        /*
        const { to_user_id, message } = data;
        const targetSocket = authUsers[to_user_id];
        if (targetSocket) {
            io.to(targetSocket).emit("receive_message", {
                from: data.from_user_id,
                message: message
            });
        }
        *//*
    });

});


// ✅ Broadcast API (used by Laravel)
app.post("/api/broadcast", (req, res) => {
    const { group_id, sender_id, message } = req.body;
    if (!group_id || !sender_id || !message) {
        console.log(req.body);        
        return res.status(400).json({ error: "Missing fields" });
    }

    const payload = {
        group_id,
        sender_id,
        message
    };
    // 📢 Emit to room
    io.to(`group_${group_id}`).emit("receive_message", payload);
    console.log("🔊 Broadcasted to group:", `group_${group_id}`, payload);
    return res.json({ success: true });
});
*/


