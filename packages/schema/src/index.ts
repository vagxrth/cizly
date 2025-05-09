import { z } from "zod";

export const createUserSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string(),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const createRoomSchema = z.object({
  roomName: z.string().min(1).max(30),
});