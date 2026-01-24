import express from 'express';
import { connectDB, disconnectDB } from './config/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';


//Import routes
import authRoutes from './routes/authRoutes.js'
import { authMiddleware } from './middleware/authMiddleware.js';

connectDB();


const port = process.env.PORT || 5001
const app = express();
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
//BODY PARSING MIDDLEWARE
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//ROUTES
app.get("/", authMiddleware, (req, res) => {
    res.json({ message: "Welcome to Bookish API" })
});

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

