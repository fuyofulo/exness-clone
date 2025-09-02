import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "secrets";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "token missing" });
        return;
    }

    const decoded = jwt.verify(token, JWT_SECRET!);
    if (!decoded) {
        res.status(401).json({ message: "invalid token" });
        return;
    }

    // @ts-ignore
    req.userId = decoded.userId;
    next();
}