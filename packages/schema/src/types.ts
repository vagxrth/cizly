import { z } from "zod";

export const userSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string(),
});

export const signInSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const createRoomSchema = z.object({
  roomName: z.string().min(1).max(30),
});