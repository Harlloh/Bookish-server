import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

export const getUserProfile = async (req, res) => {
    const { accessToken } = req.cookies
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET)

    const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: {
            books: true,
            reviews: true
        }
    })

    if (!user) {
        return res.status(404).json({ error: "User profile not found" })
    }


    res.status(200).json({ success: true, data: user, message: 'User profile fetched successfully' })
}