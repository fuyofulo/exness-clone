import { prismaclient } from "database";
import { Router } from "express";
import { spotOrderSchema, cfdOrderSchema } from "schemas";
import { getlatestPrice, connectRedis } from "exness_redis";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.post("/create", async (req, res) => {
    console.log('inside create order endpoint')
  
    try {
        console.log(req.body);
        const orderType = req.body.orderType;

        if(orderType === "SPOT") {

            const parsedData = spotOrderSchema.safeParse(req.body);

            if(!parsedData.success) {
                console.error(parsedData.error);
                res.status(403).json({
                    message: "Invalid request body"
                })
                return;
            } 
            // get asset price from redis
            const realtime_price = await getlatestPrice(parsedData.data.asset);

            // check slippage (need to implement)
            // THE EXECUTION ENGINE SHOULD HANDLE THE SLIPPAGE AND THE ORDER EXECUTION

            // create order entry in database
            // const order_entry = await prismaclient.order.create({
            //     data: {
            //         // @ts-ignore
            //         userId: req.userId,
            //         asset: parsedData.data.asset,
            //         orderType: "SPOT",
            //         direction: parsedData.data.direction,
            //         qty: parsedData.data.quantity,
            //         entryPrice: realtime_price!.price,
            //         status: "OPEN",
            //         createdAt: new Date(),
            //         updatedAt: new Date(),
            //     }
            // })
            // send to execution queue
            

            console.log('you have placed a spot order');
            res.json({
                message: "Spot order created",
                price: realtime_price
            })

        } else if (orderType === "CFD") {

            const parsedData = cfdOrderSchema.safeParse(req.body);

            if(!parsedData.success) {
                console.error(parsedData.error);
                res.status(403).json({
                    message: "Invalid request body"
                })
                return;
            }

            // get asset price from redis
            // check slippage 
            // send to execution queue
            // send to monitor and redis
            
            console.log('you have placed a cfd order');
            res.json({
                message: "CFD order created"
            })

        } else {
            res.status(403).json({ message: "You have provided bullshit" })
        }
    } catch (error) {
        console.error(error);
    }

});

export const orderRouter = router;