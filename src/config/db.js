import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

// Create the PostgreSQL pool
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

// Create the adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with the adapter
const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ["query", "error", "warn"] : ["error"],
});

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('DB connected via prisma');
    } catch (error) {
        console.error('Database connection error:', error.message);
        process.exit(1);
    }
}
const disconnectDB = async () => {
    try {
        await prisma.$disconnect();
        console.log('DB disconnected');
    } catch (error) {
        console.error('Database disconnection error:', error.message);
        process.exit(1);
    }
}

export { prisma, connectDB, disconnectDB };