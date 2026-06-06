import { prisma } from "../db.js";

export const getDashboardStat = async (req, res) => {
  const [
    totalBooks,
    totalReviews,
    totalMembers,
    recentBooks,
    allBooksWithRatings,
  ] = await Promise.all([
    prisma.books.count(),
    prisma.reviews.count(),
    prisma.user.count(),

    // Recently added - last 4 books
    prisma.books.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        reviews: { select: { star: true } },
      },
    }),

    // All books with their reviews (for top rated calculation)
    prisma.books.findMany({
      include: {
        reviews: { select: { star: true } },
      },
    }),
  ]);

  // Helper to calculate avg rating
  const formatBooks = (books) =>
    books.map((book) => {
      const reviewCount = book.reviews.length;
      const avgRating =
        reviewCount > 0
          ? book.reviews.reduce((sum, r) => sum + r.star, 0) / reviewCount
          : 0;
      return { ...book, avgRating, reviewCount };
    });

  const recentFormatted = formatBooks(recentBooks);

  // Top rated: sort by avgRating descending, take top 4
  const topRatedBooks = formatBooks(allBooksWithRatings)
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 5);
  const response = {
    totalBooks,
    totalReviews,
    recentBooks: recentFormatted,
    topRatedBooks,
  };
  if (req.user) {
    response.totalMembers = totalMembers;
  }
  res.json(response);
};
