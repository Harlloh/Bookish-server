import cloudinary from "../../utils/cloudinary.js"
import { prisma } from "../db.js"

export const getAllBooks = async (req, res) => {
    const response = await prisma.books.findMany()
    console.log(response);
    res.json({ success: true, message: 'All books gotten successfully', data: response })
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

export const getDashboardStat = async (req, res) => {
    const [totalBooks, totalReviews, totalMembers, recentBooks, topRatedBooks] = await Promise.all([
        prisma.books.count(),
        prisma.reviews.count(),
        prisma.user.count(),

        //recently aded -last 4 books
        prisma.books.findMany({
            take: 4,
            orderBy: { createdAt: 'desc' },
            include: { select: { star: true } },
        }),

        prisma.books.findMany({
            include: {
                reviews: { select: { star: true } }
            }
        })
    ])

    //calculate avg rating and review count for each book
    // const formatBooks = (books) =>
    //     books.map((book) => ({

    //     }))
}