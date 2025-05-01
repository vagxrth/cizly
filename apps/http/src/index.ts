import express from "express";
import jwt from "jsonwebtoken";
import middleware from "./middleware.js";
import { createRoomSchema, signInSchema, createUserSchema } from "@repo/schema/types";
import dotenv from "dotenv";
import { prismaClient } from '@repo/db/client';

const app = express();

dotenv.config();

app.post("/signup", async (req, res) => {
  const data = createUserSchema.parse(req.body);
  const user = await prismaClient.user.create({
    data: {
      username: data.username,
      password: data.password,
    },
  });
  res.json({
    userId: user.id,
  })
});

app.post("/signin", async (req, res) => {
  const data = signInSchema.parse(req.body);
  const user = await prismaClient.user.findUnique({
    where: {
      username: data.username,
    },
  });
  if (!user) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string);
  res.json({ token });
});

app.post("/create-room", middleware, async (req, res) => {
  const data = createRoomSchema.parse(req.body);
  const room = await prismaClient.room.create({
    data: {
      roomName: data.roomName,
      adminId: req.userId,
    },
  });
  if (!data) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  res.json({
    roomId: room.id,
  })
});

app.get("/rooms/:roomId", middleware, async (req, res) => {
  const roomId = req.params.roomId;
  const messages = await prismaClient.message.findMany({
    where: {
      roomId: roomId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });
  res.json({
    messages: messages,
  })
})

app.get("/rooms/:roomName", middleware, async (req, res) => {
  const roomName = req.params.roomName;
  const room = await prismaClient.room.findUnique({
    where: {
      roomName: roomName,
    },
  });
  if (!room) {
    res.status(400).json({ error: "Room not found" });
    return;
  }
  res.json({
    room
  })
})
app.listen(3001, () => {
  console.log("Server is running on port 3001");
});