import { config } from "dotenv";
import path from "path";

config({ path: path.join(__dirname, "../.env") });

export const JWT_SECRET = process.env.JWT_SECRET;
export const DATABASE_URL = process.env.DATABASE_URL;
export const REDIS_URL = process.env.REDIS_URL;
export const KAFKA_BROKERS = process.env.KAFKA_BROKERS;
export const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID;

if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");
if (!REDIS_URL) throw new Error("REDIS_URL is not set");
if (!KAFKA_BROKERS) throw new Error("KAFKA_BROKERS is not set");
if (!KAFKA_CLIENT_ID) throw new Error("KAFKA_CLIENT_ID is not set");