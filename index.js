const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/robots.txt", (req, res) => {
  res.sendFile(path.resolve(__dirname, "robots.txt"));
});

const dekpuaRouter = require("./routes/dekpua");

app.use("/dekpua", dekpuaRouter);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
