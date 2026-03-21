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
export async function editReviewController(req, res) {
    const { id } = req.params; // this is the REVIEW id
    const userId = req.user.id;
    const { star, comment } = req.body;

    if (!star || !comment) {
        return res.status(400).json({ success: false, error: 'Star rating and comment are required' });
    }
    if (star < 1 || star > 5) {
        return res.status(400).json({ success: false, error: 'Star rating must be between 1 and 5' });
    }

    // Find the review first to get bookId and verify ownership
    const existingReview = await prisma.reviews.findUnique({ where: { id } });
    if (!existingReview) {
        return res.status(404).json({ success: false, error: 'Review not found' });
    }

    // Make sure the review belongs to this user
    if (existingReview.createdById !== userId) {
        return res.status(403).json({ success: false, error: 'You can only edit your own reviews' });
    }

    const bookId = existingReview.bookId; // ← get bookId from the review

    // Update the review
    const review = await prisma.reviews.update({
        where: { id },
        data: { star, comment, edited: true }, // ← only update these three fields
        select: {
            id: true,
            star: true,
            comment: true,
            createdOn: true,
            createdBy: { select: { id: true, name: true } },
        }
    });

    // Recalculate avgRating using the correct bookId
    const aggregate = await prisma.reviews.aggregate({
        where: { bookId },
        _avg: { star: true },
        _count: { star: true }
    });

    await prisma.books.update({
        where: { id: bookId },
        data: {
            avgRating: aggregate._avg.star ?? 0,
            reviewCount: aggregate._count.star
        }
    });

    res.status(200).json({ success: true, review });
}

