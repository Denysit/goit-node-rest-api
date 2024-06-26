import 'dotenv/config';
import express from "express";
import morgan from "morgan";
import cors from "cors";
import "./db/db.js";
import routes from "./routes/index.js";
import path from "path";

const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

app.use(express.static(path.resolve("public")))

app.use("/api", routes);


app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

app.listen(3000, () => {
  console.log("Server is running. Use our API on port: 3000");
});