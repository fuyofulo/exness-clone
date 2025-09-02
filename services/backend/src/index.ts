import express from "express";
import { userRouter } from "./routes/user";
import { orderRouter } from "./routes/order";
import { connectRedis } from "exness_redis";

const app = express();
app.use(express.json());

async function main() {
  await connectRedis();
}


app.use("/user", userRouter);
app.use("/orders", orderRouter);

app.listen(7100, () => {
  console.log("Server is running on port 7100");
});

main();