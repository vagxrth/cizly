import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  userId: string;
  rooms: string[];
  ws: WebSocket;
}

const users: User[] = [];

const checkUser = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    if (!decoded.userId) {
      return null;
    }
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

wss.on("connection", (ws, request) => {

  const url = request.url;
  if (!url) {
    ws.close();
    return;
  }

  const queryString = url.includes("?") ? url.split("?")[1] : "";
  const queryParams = new URLSearchParams(queryString);
  const token = queryParams.get("token");
  if (!token) {
    ws.close();
    return;
  }

  const userAuthenticated = checkUser(token);
  if (!userAuthenticated) {
    ws.close();
    return;
  }

  const current = {
    userId: userAuthenticated,
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
    } catch (error) {
      console.error("Failed to parse message:", error);
      return; // Skip processing this message
    }
    if (data.type === "join-room") {
      if (!data.roomId || typeof data.roomId !== 'string') {
        ws.send(JSON.stringify({ type: "error", message: "Invalid roomId" }));
        return;
      }
      // Optionally: Check if room exists and user has permission
      users.find((user) => user.userId === userAuthenticated)?.rooms.push(data.roomId);
      ws.send(JSON.stringify({ type: "room-joined", roomId: data.roomId }));
    }

    if (data.type === "leave-room") {
      const user = users.find((user) => user.userId === userAuthenticated);
      if (user) {
        user.rooms = user.rooms.filter((room) => room !== data.roomId);
      }
    }

    if (data.type === "send-message") {
      const roomId = data.roomId;
      const message = data.message;

      if (!roomId || typeof roomId !== 'string' || !message || typeof message !== 'string') {
        ws.send(JSON.stringify({ type: "error", message: "Invalid roomId or message" }));
        return;
      }

      try {
        await prismaClient.message.create({
          data: {
            roomId: roomId,
            message: message,
            userId: userAuthenticated,
          },
        });
      } catch (error) {
        console.error("Failed to save message:", error);
        ws.send(JSON.stringify({ type: "error", message: "Failed to save message" }));
        return;
      }
    }
      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(JSON.stringify({
            type: "message",
            roomId: roomId,
            userId: userAuthenticated,
            message: message,
            timestamp: new Date().toISOString(),
          }));
        }
      });
    }
  });
});