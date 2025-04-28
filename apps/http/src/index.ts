import express from "express";
import jwt from "jsonwebtoken";
import middleware from "./middleware.js";
import { createRoomSchema, signInSchema, createUserSchema } from "@repo/schema/types";
import dotenv from "dotenv";

const app = express();

dotenv.config();

app.post("/signup", (req, res) => {
  const data = createUserSchema.parse(req.body);
  res.json({
    userId: 1,
  })
});

app.post("/signin", (req, res) => {
  const data = signInSchema.parse(req.body);
  if (!data) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const userId = 1;
  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string);
  res.json({ token });
});

app.post("/create-room", middleware, (req, res) => {
  const data = createRoomSchema.parse(req.body);
  if (!data) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  res.json({
    roomId: 1,
  })
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});