const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookie = require("cookie-session");
const Todo = require("./models/Todo");
const User = require("./models/users.module");
const bcrypt = require("bcrypt");
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(
  cookie({
    name: "sid",
    secret: "secret",
    secure: false,
    httpOnly: true,
    sameSite: "none",
  })
);

mongoose
  .connect("mongodb://127.0.0.1:27017/mern-todo", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to Db"))
  .catch(console.error);

app.get("/todos", async (req, res) => {
  // console.log(req.session);
  const todos = await Todo.find({
    email: req.session.user.email,
  });
  // console.log(todos);
  if (todos.length > 0) return res.json(todos);
  res.json({ status: 404, message: "No todos found" });
});

app.post("/todo/new", async (req, res) => {
  try {
    const data = req.body.text;
    // if (data === "") return res.json({ status: 400, message: "Empty todo" });
    const todo = new Todo({
      text: data,
      email: req.session.user.email,
    });
    const savedTodo = await todo.save();
    res.json(savedTodo);
  } catch (err) {
    res.send(err);
  }
});

app.delete("/todo/delete/:id", async (req, res) => {
  const result = await Todo.findByIdAndDelete(req.params.id);
  res.json(result);
});

app.get("/todo/complete/:id", async (req, res) => {
  const todo = await Todo.findById(req.params.id);

  todo.complete = !todo.complete;

  todo.save();
  res.json(todo);
});

app.post("/user/register", async (req, res) => {
  try {
    const newPassword = await bcrypt.hash(req.body.password, 10);
    await User.create({
      name: req.body.name,
      email: req.body.email,
      password: newPassword,
    });
    res.json({ status: "success", message: "Registreded Succecfully" });
  } catch (err) {
    console.log(err);
    res.json({ status: "error", message: "Duplicate email" });
  }
});
app.post("/user/login", async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  });
  // console.log(user);

  if (!user) {
    return res.json({ status: "error", message: "Invalid Email" });
  }

  const isPasswordCorrect = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!isPasswordCorrect) {
    return res.json({ status: "error", message: "Invalid Password" });
  }
  req.session.user = user;
  res.json({ status: "success", message: "Logged in successfully" });
});

app.get("/user/verify", async (req, res) => {
  if (!req.session.user) {
    return res.json({ status: "error", message: "Unauthenticated" });
  }
  res.json(req.session.user);
});
app.get("/user/getUser", async (req, res) => {
  const user = await User.findOne({ email: req.session?.user?.email });
  res.json(user);
});
app.post("/user/logout", async (req, res) => {
  req.session.user = null;
  res.send({ status: "success", message: "Logged out successfully" });
});

app.listen(8000, () => console.log("Server startedon port 8000"));
