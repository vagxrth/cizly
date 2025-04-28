import express from "express";
import jwt from "jsonwebtoken";
import middleware from "./middleware";

const app = express();

app.post("/signup", (req, res) => {
  res.json({
    userId: 1,
  })
});

app.post("/signin", (req, res) => {
  const userId = 1;
  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string);
  res.json({ token });
});

app.post("/create-room", middleware, (req, res) => {
  res.json({
    roomId: 1,
  })
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});