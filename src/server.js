import express from 'express';
import { connectDB, disconnectDB } from './config/db.js';

//Import routes
import movieRoutes from './routes/movieRoutes.js'
import watchlistRoutes from './routes/watchlistRoutes.js'
import authRoutes from './routes/authRoutes.js'

connectDB();


const port = process.env.PORT || 5001
const app = express();

//BODY PARSING MIDDLEWARE
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//ROUTES
app.use("/movies", movieRoutes)
app.use("/watchlist", watchlistRoutes)
app.use("/auth", authRoutes);
const server = app.listen(port, () => console.log(`listening to port ${port}`))






process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection  : ${err.message}`);
    server.close(async () => {
        await disconnectDB();
        process.exit(1);
    })
});
process.on('uncaughtException', async (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
    await disconnectDB();
    process.exit(1);
});
process.on('SIGINT', async (err) => {
    console.error(`SIGTERM received, shutting down: ${err.message}`);
    server.close(async () => {
        await disconnectDB();
        process.exit(1);
    })
});

