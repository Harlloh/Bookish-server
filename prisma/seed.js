import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";

const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const creatorId = 'd4760284-b7d9-452a-9bb4-012d554caef3'

const movies = [
    {
        title: "The Matrix",
        overview: "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
        releaseYear: 1999,
        genres: ["Action", "Sci-Fi"],
        runtime: 136,
        posterUrl: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
        createdBy: creatorId,
    },
    {
        title: "Inception",
        overview: "A skilled thief is given a chance at redemption if he can successfully perform an impossible dream infiltration.",
        releaseYear: 2010,
        genres: ["Action", "Sci-Fi", "Thriller"],
        runtime: 148,
        posterUrl: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
        createdBy: creatorId,
    },
    {
        title: "Interstellar",
        overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        releaseYear: 2014,
        genres: ["Adventure", "Drama", "Sci-Fi"],
        runtime: 169,
        posterUrl: "https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
        createdBy: creatorId,
    },
    {
        title: "The Dark Knight",
        overview: "Batman faces the Joker, a criminal mastermind who plunges Gotham City into chaos.",
        releaseYear: 2008,
        genres: ["Action", "Crime", "Drama"],
        runtime: 152,
        posterUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        createdBy: creatorId,
    },
    {
        title: "Avatar",
        overview: "A paraplegic Marine is dispatched to the moon Pandora and becomes torn between following orders and protecting its people.",
        releaseYear: 2009,
        genres: ["Action", "Adventure", "Fantasy"],
        runtime: 162,
        posterUrl: "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
        createdBy: creatorId,
    }
];


const main = async () => {
    console.log('Seeding movies...');
    for (const movie of movies) {
        await prisma.movie.create({
            data: movie,
        });
        console.log('Created movie', movie);
    }

    console.log('Seeding completed');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});