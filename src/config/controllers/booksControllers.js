import { prisma } from "../db.js"

export const getAllBooks = async (req, res) => {
    res.json({ message: 'gett all books' })
}
export const addBook = async (req, res) => {
    const payload = req.body
    res.json({ message: 'gett all books' })
}