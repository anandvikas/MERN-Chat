require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const CronJob = require("cron").CronJob;
const UserCron = require("./cronJob/user");
const { eventListeners } = require("./socket/listeners");
const userRoutes = require("./routes/user");
const avatarRoutes = require("./routes/avatar");
const chatRoute = require("./routes/chatRoom");


const PORT = process.env.PORT;
const app = express();
app.use(express.json());
app.use(
  cors()
);

app.use("/uploads", express.static(path.join("uploads")));

app.use("/user", userRoutes);
app.use("/avatar", avatarRoutes);
app.use("/chat", chatRoute);

const DB_NAME = PORT === "3091" ? process.env.DB_NAME_PROD : process.env.DB_NAME_DEV;
const MONGOURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o0ett.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;

mongoose
  .connect(MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
    // strictQuery: false
  })
  .then(async (data) => {
    console.log("MongoDB Connected.!");
    const server = app.listen(PORT, console.log("listning", PORT));
    const io = require("./socket/socket").init(server);
    io.on("connection", (socket) => {
      eventListeners(socket);
    });
  })
  .catch((err) => console.log(err));

// cron work -----
var job = new CronJob(
  "0 0 * * *",
  async () => {
    await UserCron.deleteExpiredAccount();
  },
  null,
  true,
  "Asia/Kolkata"
);
