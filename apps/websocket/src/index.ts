import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  userId: string;
  rooms: string[];
  ws: WebSocket;
}

const users: User[] = [];

const checkUser = (token: string): string | null => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
  if (!decoded.userId) {
    return null;
  }
  return decoded.userId;
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

  users.push({
    userId: userAuthenticated,
    rooms: [],
    ws: ws,
  });

  ws.on("message", (message) => {

    const data = JSON.parse(message.toString());

    if (data.type === "join-room") {
      users.find((user) => user.userId === userAuthenticated)?.rooms.push(data.roomId);
    }

    if (data.type === "leave-room") {
      const user = users.find((user) => user.userId === userAuthenticated);
      if (user) {
        user.rooms = user.rooms.filter((room) => room !== data.roomId);
      }
    }

    if (data.type === "send-message") {
      const user = users.find((user) => user.userId === userAuthenticated);
      if (user) {
        users.forEach((user) => {
          if (user.rooms.includes(data.roomId)) {
            user.ws.send(JSON.stringify({
              type: "message",
              message: data.message,
            }));
          }
        });
      }
    }
  });
});