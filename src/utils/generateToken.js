import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
    const payload = { id: userId };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    })
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: (1000 * 600 * 60 * 24) * 7 ///7 days in milli second
    })
    return token
}

