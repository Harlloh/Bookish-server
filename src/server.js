import express from 'express';
import { connectDB, disconnectDB } from './config/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

//Import routes

import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/booksRoutes.js';
import userProfileRoutes from './routes/userRoutes.js';
import { authMiddleware } from './middleware/authMiddleware.js';


connectDB();


const port = process.env.PORT || 5001
const app = express();

//BODY PARSING MIDDLEWARE
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//ROUTES
app.use("/auth", authRoutes);
//PUT THIS HERE SO THAT ALL ROUTES BELOW THIS WILL NEED AUTHENTICATION
app.use(authMiddleware)
app.use("/books", bookRoutes);
app.use('/profile', userProfileRoutes)

app.use("/", (req, res) => {
    res.json({ message: "Welcome to Bookish Server" })
});
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

