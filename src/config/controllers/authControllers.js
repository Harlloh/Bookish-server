import { generateToken } from "../../utils/generateToken.js";
import { prisma } from "../db.js";
import bcrypt from 'bcryptjs';


export const register = async (req, res) => {
    const { name, email, password } = req.body
    //check if user already exist
    const userExist = await prisma.user.findUnique({
        where: { email: email }
    });

    if (userExist) {
        return res.status(401).json({ error: 'User already exist with this email!' })
    }

    //HASH PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt)

    //CREATE USER
    const user = await prisma.user.create({
        data: {
            name,
            password: hashedPassword,
            email
        }
    });

    //GENERATE TOKEN
    const token = generateToken(user.id, res);

    // res.json({ msg: 'Holla' })
    res.json({
        status: 'success',
        data: {
            user: {
                id: user.id,
                user: name,
                email: email
            },
            token
        }
    })
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    //CHECK IF USER EXIST
    const user = await prisma.user.findUnique({
        where: { email: email }
    })

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' })
    }

    //GENERATE JWT TOKEN
    const token = generateToken(user.id, res);

    // res.json({ msg: 'Holla' })
    res.json({
        status: 'success',
        message: 'User logged in successfully',
        data: {
            user: {
                id: user.id,
                user: user.name,
                email: email
            },
            token,
        }
    })
}


export const logout = async (req, res) => {
    res.cookie('jwt', "", {
        expires: new Date(0),
        httpOnly: true,
    });
    res.status(200).json({ message: 'User logged out successfully' });
}