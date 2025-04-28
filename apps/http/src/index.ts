import express from "express";

const app = express();

app.post("/signup", (req, res) => {
  const { email, password } = req.body;
  res.send("Hello World");
});

app.post("/signin", (req, res) => {
  const { email, password } = req.body;
  res.send("Hello World");
});

app.post("/create-room", (req, res) => {
  const { roomId } = req.body;
  res.send("Hello World");
});



app.listen(3001, () => {
  console.log("Server is running on port 3001");
});