import { prismaclient } from "database";
import { Router } from "express";
import { spotOrderSchema, cfdOrderSchema } from "schemas";
import { REDIS_URL } from "secrets";
import redis from "redis";

const router = Router();

async function getAssetPrice(asset: string) {
    await redis.createClient({ url: REDIS_URL as any });
    

}

router.post("/create", async (req, res) => {
  
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
            // check slippage
            // send to execution queue directly

            console.log('you have placed a spot order');
            res.json({
                message: "Spot order created"
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