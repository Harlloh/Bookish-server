import { prisma } from "../db.js";

export async function addReviewController(req, res) {
    const { id } = req.params;
    const userId = req.user.id;  // ← define it here
    const { star, comment } = req.body;

    if (!star || !comment) {
        return res.status(400).json({ success: false, error: 'Star rating and comment are required' });
    }
    if (star < 1 || star > 5) {
        return res.status(400).json({ success: false, error: 'Star rating must be between 1 and 5' });
    }

    const book = await prisma.books.findUnique({ where: { id } });
    if (!book) {
        return res.status(404).json({ success: false, error: 'Book not found' });
    }

    const existingReview = await prisma.reviews.findUnique({
        where: { bookId_createdById: { bookId: id, createdById: userId } }
    });
    if (existingReview) {
        return res.status(400).json({ success: false, error: 'You have already reviewed this book' });
    }

    const review = await prisma.reviews.create({
        data: { star, comment, bookId: id, createdById: userId },
        select: {
            id: true,
            star: true,
            comment: true,
            createdOn: true,
            createdBy: { select: { id: true, name: true } }
        }
    });

    const aggregate = await prisma.reviews.aggregate({
        where: { bookId: id },
        _avg: { star: true },
        _count: { star: true }
    });

    await prisma.books.update({
        where: { id },      // ← fixed
        data: {
            avgRating: aggregate._avg.star ?? 0,
            reviewCount: aggregate._count.star
        }
    });

    res.status(201).json({ success: true, review });
}