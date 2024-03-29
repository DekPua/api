const express = require("express");
const cors = require("cors");
const path = require('path');
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/robots.txt", (req, res) => {
  res.sendFile(path.resolve(__dirname, "robots.txt"));
});

const dekpuaRouter = require("./routes/dekpua");
const autoPublistRouter = require("./routes/autopublish");
const authRouter = require("./routes/auth");

app.use("/dekpua", dekpuaRouter);
app.use("/autopublish", autoPublistRouter);
app.use("/auth", authRouter);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
