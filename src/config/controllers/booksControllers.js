import { success } from "zod"
import cloudinary from "../../utils/cloudinary.js"
import { prisma } from "../db.js"

export const getAllBooks = async (req, res) => {
    const { sort, page = 1, pageSize = 10, search } = req.query;


    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);
    const skip = (pageNum - 1) * pageSizeNum;
    const searchText = search

    //build search filter
    const where = searchText ? {
        OR: [
            { title: { contains: searchText, mode: 'insensitive' } },
            { author: { contains: searchText, mode: 'insensitive' }, }
        ]
    } : {};

    const orderBy = sort === 'rating' ? { avgRating: 'desc' } :
        sort === 'title' ? { title: 'asc' } :
            { createdAt: 'desc' };

    const [books, total] = await Promise.all([
        prisma.books.findMany({
            where,
            orderBy,
            skip,
            take: pageSizeNum,
            include: {
                addedBy: { select: { id: true, name: true } }
            }
        }),
        prisma.books.count({ where })
    ]);

    res.json({
        success: true,
        data: books,
        pagination: {
            total,
            page: pageNum,
            pageSize: pageSizeNum,
            totalPages: Math.ceil(total / pageSizeNum),
            hasNextPage: pageNum < Math.ceil(total / pageSizeNum),
            hasPrevPage: pageNum > 1,
        }
    })
}

export const getBookByName = async (req, res) => {
    const { title } = req.body

    if (!title) {
        return res.json({ success: false, data: [] })
    }

    const books = await prisma.books.findMany({
        where: {
            title: { contains: title, mode: 'insensitive' }
        },
        select: {
            title: true,
            id: true,
            imageUrl: true,
        }
    })

    res.json({ success: true, data: books })
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
                    edited: true,
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

