const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let members = [];
let history = [];

io.on("connection", (socket) => {
    console.log("Utilisateur connecté :", socket.id);

    socket.on("user:join", (data) => {
        const member = {
            id: socket.id,
            name: data.name,
            status: "En ligne"
        };

        members.push(member);
        history.push(`${data.name} a rejoint le board`);

        io.emit("members:update", members);
        io.emit("history:update", history);
    });

    socket.on("status:change", (data) => {
        members = members.map((member) => {
            if (member.id === socket.id) {
                history.push(`${member.name} → ${data.status}`);
                return { ...member, status: data.status };
            }
            return member;
        });

        io.emit("members:update", members);
        io.emit("history:update", history);
    });

    socket.on("disconnect", () => {
        const user = members.find((m) => m.id === socket.id);

        if (user) {
            history.push(`${user.name} a quitté le board`);
        }

        members = members.filter((m) => m.id !== socket.id);

        io.emit("members:update", members);
        io.emit("history:update", history);

        console.log("Utilisateur déconnecté :", socket.id);
    });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log("Serveur backend démarré sur le port " + PORT);
});