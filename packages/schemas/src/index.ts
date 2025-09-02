import { z } from "zod";

// user schema
export const signupSchema = z.object({
    name: z.string().min(1),
    password: z.string().min(1),
    email: z.email(),
});

export const signinSchema = z.object({
    email: z.email(),
    password: z.string().min(1),
});

export const spotOrderSchema = z.object({
    asset: z.string(),                         // e.g. "BTC/USDT"
    quantity: z.number().positive(),           // how much user buys/sells
    decimals: z.number().int().nonnegative(),  // asset precision
    direction: z.enum(["BUY", "SELL"]),        // spot = buy/sell, not long/short
    orderType: z.literal("SPOT"),
    slippage: z.number(),
});


export const cfdOrderSchema = z.object({
    asset: z.string(),                        // e.g. "BTC/USDT"
    margin: z.number().positive(),            // real user capital at risk
    leverage: z.number().positive(),          // multiplier (e.g. 10)
    decimals: z.number().int().nonnegative(), // asset precision
    direction: z.enum(["LONG", "SHORT"]),     // leveraged bets
    orderType: z.literal("CFD"),
    slippage: z.number(),
    
    // optional risk controls from user
    stopLossPrice: z.number().positive().optional(),
    takeProfitPrice: z.number().positive().optional(),
});
  