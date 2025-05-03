import { WebSocketServer, WebSocket } from "ws";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 8080;

const wss = new WebSocketServer({ port: PORT });
console.log(`WebSocket server is running on port ${PORT}`);

type User = {
    rooms: string[];
    ws: WebSocket;
};

const users: User[] = [];

wss.on("connection", (ws, request) => {
    const url = request.url;
    if (!url) {
        ws.close();
        return;
    }

    const current = {
        rooms: [],
        ws: ws,
    };
    users.push(current);

    ws.on("close", () => {
        const idx = users.indexOf(current);
        if (idx !== -1) users.splice(idx, 1);
    });

    ws.on("message", async (message) => {
        let data;
        try {
            data = JSON.parse(message.toString());
            // Broadcast to all users in the room
            users.forEach((user) => {
                if (user.ws.readyState === WebSocket.OPEN) {
                    user.ws.send(message.toString());
                }
            });
        } catch (error) {
            console.error("An error occurred while broadcasting the message. This may include parsing or sending issues:", error);
            return;
        }
    });
});