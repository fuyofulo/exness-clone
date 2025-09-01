import express from "express";
import { userRouter } from "./routes/user";

const app = express();
app.use(express.json());

app.use("/user", userRouter);

app.listen(7100, () => {
  console.log("Server is running on port 7100");
});