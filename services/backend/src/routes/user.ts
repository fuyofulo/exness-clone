import { Router } from "express";
import { prismaclient } from "database";
import { JWT_SECRET } from "secrets";
import { signupSchema, signinSchema } from "schemas";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = Router();

router.post("/signup", async (req, res) => {

    const parsedData = signupSchema.safeParse(req.body);

    if (!parsedData.success) {
        res.status(403).json({
            message: "Invalid request body",
        });
        return;
    }

    const { name, password, email } = parsedData.data;


    const existingUser = await prismaclient.user.findUnique({
        where: {
            email,
        },
    });
    
    if (existingUser) {
        res.status(403).json({
            message: "User already exists",
            userId: existingUser.id,
        });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prismaclient.user.create({
        data: {
            email,
            name,
            password: hashedPassword,
        },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET!);

    res.status(200).json({
        userId: user.id,
        name: user.name,
        token: token,
    });

});

router.post("/signin", async (req, res) => {    

    const parsedData = signinSchema.safeParse(req.body);

    if (!parsedData.success) {
        res.status(403).json({
            message: "Invalid request body",
        });
        return;
    }

    const { email, password } = parsedData.data;

    const user = await prismaclient.user.findUnique({
        where: {
            email,
        },
    });

    if (!user) {
        res.status(403).json({
            message: "User not found",
        });
        return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        res.status(403).json({
            message: "Invalid credentials",
        });
        return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET!);

    res.status(200).json({
        userId: user.id,
        name: user.name,
        token: token,
    });

});

export const userRouter = router;