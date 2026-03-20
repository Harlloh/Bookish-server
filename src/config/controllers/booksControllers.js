import { success } from "zod"
import cloudinary from "../../utils/cloudinary.js"
import { prisma } from "../db.js"

export const getAllBooks = async (req, res) => {
    const { sort, page, pageSize, search } = req.query
    const response = await prisma.books.findMany()
    console.log(response);
    res.json({ success: true, message: 'All books gotten successfully', data: response })
}


export const getBookById = async (req, res) => {
    const { id } = req.params

    const book = await prisma.books.findUnique({
        where: { id },
        include: {
            reviews: {
                select: {
                    id: true,
                    star: true,
                    comment: true,
                    createdOn: true,
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                },
                orderBy: { createdOn: 'desc' },
                take: 10
            },
            addedBy: {
                select: {
                    id: true,
                    name: true,
                }
            }
        }
    });

    if (!book) {
        return res.status(404).json({ success: false, error: 'book not found' })
    }

    res.json({ success: true, book })
}


export const addBook = async (req, res) => {
    const { title, author, overview, } = req.body;
    const publishedYear = parseInt(req.body.publishedYear)
    console.log(req.body);

    if (!title || !author || !publishedYear) {
        return res.status(400).json({
            success: false,
            error: 'Title, author, and published year are required'
        });
    }
    let imageUrl;

    if (req.file) {
        // uploading the image first
        try {
            if (req.file) {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'books',
                });
                if (!result) {
                    return res.status(500).json({ error: 'Error uploading image', success: false })
                }

                imageUrl = result.secure_url;
            }



            const response = await prisma.books.create({
                data: {
                    title,
                    author,
                    overview: overview || '',
                    imageUrl,
                    publishedYear,
                    addedById: req.user.id
                }
            })
            if (!response) {
                return res.status(500).json({ error: 'Error uploading book', success: false })
            }
            console.log(response, "response after craeting the book");
            return res.status(201).json({
                success: true,
                message: 'Book added successfully',
                book: response
            });
        } catch (error) {
            console.error('Upload failed:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to upload image'
            });
        }
    }
}

