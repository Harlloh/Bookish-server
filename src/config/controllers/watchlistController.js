import { prisma } from "../db.js";

export const addToWatchList = async (req, res) => {
    const { movieId, status, rating, notes } = req.body

    //Verify the movie exists in the database
    const movie = await prisma.movie.findUnique({
        where: { id: movieId }
    })
    if (!movie) {
        return res.status(404).json({ error: 'Movie not found' });
    }
    //check if already added
    const existingInWatchlist = await prisma.watchlistItem.findUnique({
        where: {
            userId_movieId: {
                userId: req.user.id,
                movieId: movieId
            }
        }
    });
    if (existingInWatchlist) {
        return res.status(400).json({ error: 'Movie already in the watchlist' });
    }


    //Create the watchlist item
    const watchlistItem = await prisma.watchlistItem.create({
        data: {
            userId: req.user.id,
            movieId,
            status: status || 'PLANNED',
            rating,
            notes,
        }
    });
    res.status(201).json({
        status: 'SUCCESS', data: {
            watchlistItem
        }
    })
}


export const deleteFromWatchList = async (req, res) => {
    const wahtchListItem = await prisma.watchlistItem.findUnique({
        where: { id: req.params.id }
    });

    if (!wahtchListItem) res.status(404).json({ error: 'Item not found' });

    //Ensure only owners can delete
    if (wahtchListItem.userId !== req.user.id) res.error(401).json({ error: 'Cannot not modify not-owner items' });

    await prisma.watchlistItem.delete({
        where: { id: req.params.id }
    })
    res.status(200).json({
        status: 'success',
        message: 'Watch list item deleted succesfully',
    })


}


export const updateWatchList = async (req, res) => {
    const { status, rating, notes } = req.body;

    //find watchList item and verify ownership
    const watchlistItem = await prisma.watchlistItem.findUnique({
        where: { id: req.params.id }
    });

    if (!watchlistItem) res.status(404).json({ error: "watchlist item not found" });


    //ensure only ownere can update
    if (watchlistItem.userId !== req.user.id) res.status(403).json({ error: 'Not allowed to update this watchlist item' });


    //build update data
    const updateData = {};
    if (status !== undefined) updateData.status = status.toUpperCase();
    if (rating !== undefined) updateData.rating = rating;
    if (notes !== undefined) updateData.notes = notes;


    //Update watchlist item
    const updatedWatchlistItem = await prisma.watchlistItem.update({
        where: { id: req.params.id },
        data: updateData,
    })
    res.status(200).json({
        status: 'success',
        data: {
            watchlistItem: updatedWatchlistItem
        }
    })
}