import express from "express";
import jwt from "jsonwebtoken";
import middleware from "./middleware.js";
import { createRoomSchema, signInSchema, createUserSchema } from "@repo/schema/types";
import dotenv from "dotenv";
import { prismaClient } from '@repo/db/client';
import cors from 'cors';

const app = express();

dotenv.config();

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000', // Allow only the Next.js frontend
  methods: ['GET', 'POST'], // Allow only needed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow needed headers
}));

// Parse JSON bodies
app.use(express.json());

// Create or get the anonymous user
const getOrCreateAnonymousUser = async () => {
  let anonymousUser = await prismaClient.user.findUnique({
    where: { username: 'anonymous' }
  });

  if (!anonymousUser) {
    anonymousUser = await prismaClient.user.create({
      data: {
        username: 'anonymous',
        password: 'anonymous',
        email: 'anonymous@example.com',
      }
    });
  }

  return anonymousUser;
};

// Create or get a room
const getOrCreateRoom = async (roomId: string) => {
  let room = await prismaClient.room.findUnique({
    where: { roomName: roomId }
  });

  if (!room) {
    const anonymousUser = await getOrCreateAnonymousUser();
    room = await prismaClient.room.create({
      data: {
        roomName: roomId,
        adminId: anonymousUser.id,
      }
    });
  }

  return room;
};

app.post("/signup", async (req, res) => {
  try {
    const data = createUserSchema.parse(req.body);
    const user = await prismaClient.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
      },
    });
    // Create token for the new user
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string);
    res.json({
      userId: user.id,
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.post("/signin", async (req, res) => {
  const data = signInSchema.parse(req.body);
  const user = await prismaClient.user.findUnique({
    where: {
      email: data.email,
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
      adminId: String(req.userId), // Convert to string
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

// Canvas endpoints without authentication
app.get("/canvas/:canvasId", async (req, res) => {
  try {
    const canvasId = req.params.canvasId;
    const room = await getOrCreateRoom(canvasId);
    
    const messages = await prismaClient.message.findMany({
      where: {
        roomId: room.id,
      },
      orderBy: {
        createdAt: "desc",  
      },
      take: 50,
    });
    res.json({
      messages: messages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

app.post("/canvas/:canvasId", async (req, res) => {
  try {
    const canvasId = req.params.canvasId;
    const messageContent = req.body.message;
    
    // Get or create room and anonymous user
    const room = await getOrCreateRoom(canvasId);
    const anonymousUser = await getOrCreateAnonymousUser();

    // Create the message
    const message = await prismaClient.message.create({
      data: {
        content: messageContent,
        roomId: room.id,
        userId: anonymousUser.id,
      }
    });

    res.json({ success: true, message });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: "Failed to save message" });
  }
});

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