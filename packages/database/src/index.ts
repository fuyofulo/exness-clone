import { PrismaClient } from "../prisma/generated/prisma";
import { DATABASE_URL } from "secrets";

export const prismaclient = new PrismaClient({
    datasources: {
        db: {
            url: DATABASE_URL as any,
        },
    },
});