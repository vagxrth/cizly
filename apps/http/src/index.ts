import express from "express";
import jwt from "jsonwebtoken";

const app = express();

app.post("/signup", (req, res) => {
  
});

app.post("/signin", (req, res) => {
  const userId = 1;
  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string);
  console.log(process.env.JWT_SECRET);
  res.json({ token });
});

app.post("/create-room", (req, res) => {
  ;
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});