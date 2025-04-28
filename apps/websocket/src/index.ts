import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
const wss = new WebSocketServer({ port: 8080 });

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
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

  if (!decoded.userId) {
    ws.close();
    return;
  }

  ws.on("message", (message) => {
    ws.send(message);
  });
});