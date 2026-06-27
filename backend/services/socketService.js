const { Server } = require("socket.io");

let io;
const onlineUsers = new Map(); // Maps userId to socketId

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: [
                "https://casexperts.netlify.app",
                "https://casexpert.netlify.app",
                "https://casexperts.vercel.app",
                "https://casexpert.vercel.app",
                "http://localhost:5173",
                "http://localhost:3000",
                process.env.FRONTEND_URL
            ].filter(Boolean),
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            credentials: true
        }
    });

    console.log("✅ Socket.IO Initialized");

    io.on("connection", (socket) => {
        console.log(`🔌 New Connection: ${socket.id}`);

        socket.on("join-room", async ({ roomId, userId, role }) => {
            console.log(`👤 User ${userId} (${role}) joining room: ${roomId}`);
            socket.join(roomId);

            // Notify host if participant joins
            if (role !== 'lawyer') {
                socket.to(roomId).emit("join-request", { userId, socketId: socket.id });
            } else {
                // Notify participant if host joins/is present
                // This tells waiting participants to re-send their join-request
                socket.to(roomId).emit("host-ready", { userId });
            }

            socket.on("recheck-lobby", () => {
                console.log(`🔍 Room ${roomId}: Lawyer requesting lobby update`);
                // Ask all clients in the room to re-identify themselves
                socket.to(roomId).emit("request-rejoin-status");
            });

            socket.to(roomId).emit("user-joined", { userId, role });
        });

        // Gated Approval Signaling
        socket.on("approve-request", ({ roomId, participantSocketId }) => {
            console.log(`✅ Host approved request in ${roomId} for ${participantSocketId}`);
            socket.to(participantSocketId).emit("request-approved", { roomId });
            // Also notify room to start WebRTC
            io.to(roomId).emit("meeting-active", { roomId });
        });

        socket.on("reject-request", ({ roomId, participantSocketId, reason }) => {
            console.log(`❌ Host rejected request in ${roomId} for ${participantSocketId}`);
            socket.to(participantSocketId).emit("request-rejected", { reason: reason || "Host declined your join request." });
        });

        // WebRTC Signaling - Only after approval logic is handled in frontend
        socket.on("webrtc-offer", (payload) => {
            console.log(`📤 Offer from ${socket.id} to room ${payload.roomId}`);
            socket.to(payload.roomId).emit("webrtc-offer", payload);
        });

        socket.on("webrtc-answer", (payload) => {
            console.log(`📥 Answer from ${socket.id} to room ${payload.roomId}`);
            socket.to(payload.roomId).emit("webrtc-answer", payload);
        });

        socket.on("webrtc-ice-candidate", (payload) => {
            console.log(`❄️ ICE Candidate from ${socket.id}`);
            socket.to(payload.roomId).emit("webrtc-ice-candidate", payload);
        });

        socket.on("leave-room", ({ roomId, userId }) => {
            console.log(`👋 User ${userId} leaving room ${roomId}`);
            socket.leave(roomId);
            socket.to(roomId).emit("user-left", { userId });
        });

        socket.on("end-call", async ({ roomId, duration }) => {
            console.log(`📞 Call ended in room ${roomId}. Duration: ${duration}s`);

            // Optionally update DB here or let the frontend trigger a REST call
            socket.to(roomId).emit("call-ended");
        });

        // ==========================================
        // REAL-TIME CHAT EVENTS
        // ==========================================
        
        // When a user logs in / connects, they register their ID
        socket.on("register-user", ({ userId }) => {
            onlineUsers.set(userId.toString(), socket.id);
            socket.join(`user_${userId}`);
            console.log(`🟢 User ${userId} is now online`);
            // Broadcast to all that this user is online (could be optimized later)
            io.emit("user-status-change", { userId, status: "online" });
        });

        // Join a specific chat conversation room
        socket.on("join-chat", ({ conversationId }) => {
            socket.join(`chat_${conversationId}`);
            console.log(`💬 Socket ${socket.id} joined chat_${conversationId}`);
        });

        // Typing indicators
        socket.on("typing", ({ conversationId, userId }) => {
            socket.to(`chat_${conversationId}`).emit("user-typing", { conversationId, userId });
        });

        socket.on("stop-typing", ({ conversationId, userId }) => {
            socket.to(`chat_${conversationId}`).emit("user-stopped-typing", { conversationId, userId });
        });

        // Check user online status
        socket.on("check-online-status", ({ userIds }, callback) => {
            const statuses = {};
            if (Array.isArray(userIds)) {
                userIds.forEach(id => {
                    statuses[id] = onlineUsers.has(id.toString());
                });
            }
            if (typeof callback === 'function') {
                callback(statuses);
            }
        });

        socket.on("disconnect", () => {
            console.log(`🔌 Disconnected: ${socket.id}`);
            
            // Remove from online users
            let disconnectedUserId = null;
            for (const [userId, sId] of onlineUsers.entries()) {
                if (sId === socket.id) {
                    disconnectedUserId = userId;
                    onlineUsers.delete(userId);
                    break;
                }
            }
            
            if (disconnectedUserId) {
                console.log(`🔴 User ${disconnectedUserId} went offline`);
                io.emit("user-status-change", { userId: disconnectedUserId, status: "offline" });
            }
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { initSocket, getIO };
