import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Your real user IDs
const users = {
  femi: "cmn33k2bl00062dof14l96rfp",
  femifemi: "cmn5526130000yova90b0k6am",
  kynn1: "cmnaho33u000128mdj0hkjdq9",
  kynn2: "cmnahrxh0000428mddw08x6kx",
  gentlesoul1: "cmnxc3kuq00021qj63io2c3un",
};

// Existing book IDs so we can seed reviews on them too
const existingBooks = {
  verity: "cmngmqgay000a28mdvfkbpt9u",
  gentlesoulDay: "cmnxc6of300051qj6cy81bq73",
};

const newBooks = [
  {
    title: "Atomic Habits",
    author: "James Clear",
    overview:
      "A practical guide to building good habits and breaking bad ones through small, incremental changes that compound over time.",
    publishedYear: 2018,
    addedById: users.kynn1,
  },
  {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt & David Thomas",
    overview:
      "A collection of lessons and best practices for software developers looking to sharpen their craft and think more effectively about code.",
    publishedYear: 1999,
    addedById: users.femifemi,
  },
  {
    title: "Deep Work",
    author: "Cal Newport",
    overview:
      "An argument for the value of focused, distraction-free work and a practical guide to cultivating that ability in a noisy world.",
    publishedYear: 2016,
    addedById: users.gentlesoul1,
  },
  {
    title: "Things Fall Apart",
    author: "Chinua Achebe",
    overview:
      "A seminal African novel following Okonkwo, an Igbo man in Nigeria, as colonialism and Christian missionaries begin dismantling his world.",
    publishedYear: 1958,
    addedById: users.kynn2,
  },
];

// Reviews per book: [userId, star, comment]
const reviewsMap = {
  [existingBooks.verity]: [
    [
      users.femifemi,
      4,
      "The psychological tension in this book is unreal. Hoover really commits to the unreliable narrator device. Finished it in two sittings.",
    ],
    [
      users.kynn1,
      3,
      "Entertaining thriller but some plot points felt stretched. The ending divided me honestly.",
    ],
    [
      users.gentlesoul1,
      5,
      "One of the most gripping reads I have had in a while. The manuscript within the story is genuinely disturbing.",
    ],
    [
      users.kynn2,
      2,
      "Overhyped. The twists felt manufactured and the characters made frustrating decisions throughout.",
    ],
  ],
  [existingBooks.gentlesoulDay]: [
    [
      users.femi,
      4,
      "Honest and personal. You can tell this came from a real place. Would love a follow-up.",
    ],
    [
      users.kynn1,
      3,
      "Decent read. A bit rough around the edges in places but the voice is authentic.",
    ],
    [
      users.femifemi,
      5,
      "Loved the rawness of it. Gentlesoul does not try to polish over the difficult parts.",
    ],
  ],
};

// Will be populated after book creation
const newBookReviews = {
  atomicHabits: [
    [
      users.femi,
      5,
      "Changed how I think about consistency. The 1% better every day concept sounds cliche until you see it framed properly here.",
    ],
    [
      users.femifemi,
      4,
      "Practical and well researched. Some sections repeat the same point but overall worth the read.",
    ],
    [
      users.kynn1,
      4,
      "Best productivity book I have read. The habit stacking technique alone was worth it.",
    ],
    [
      users.kynn2,
      3,
      "Good content but could have been a long blog post. Padded in places.",
    ],
    [
      users.gentlesoul1,
      5,
      "I have tried to build habits before and always failed. This book finally gave me a framework that stuck.",
    ],
  ],
  pragmaticProgrammer: [
    [
      users.femi,
      5,
      "Every chapter has something actionable. The section on orthogonality shifted how I think about writing decoupled code.",
    ],
    [
      users.kynn1,
      4,
      "A classic for a reason. Some advice is dated but the core philosophy holds up completely.",
    ],
    [
      users.gentlesoul1,
      4,
      "Dense but rewarding. Not a casual read, you need to sit with it. Came back to certain chapters multiple times.",
    ],
    [
      users.kynn2,
      3,
      "Good reference material but not something you read front to back easily. Better as a resource to revisit.",
    ],
  ],
  deepWork: [
    [
      users.femifemi,
      5,
      "Newport makes a compelling case. I restructured my whole morning routine after reading this.",
    ],
    [
      users.femi,
      4,
      "Solid argument. The examples from academia and tech are well chosen. Drags slightly in the second half.",
    ],
    [
      users.kynn2,
      5,
      "This book diagnosed exactly what was wrong with how I was working. The shallow work trap is real.",
    ],
    [
      users.kynn1,
      3,
      "The core idea is strong but he overexplains it. You get the point by chapter three and then he keeps going.",
    ],
    [
      users.gentlesoul1,
      4,
      "Genuinely useful. Pairs well with Atomic Habits if you want to actually act on what Newport recommends.",
    ],
  ],
  thingsFallApart: [
    [
      users.femi,
      5,
      "A masterpiece. Achebe writes with such precision. Every sentence earns its place.",
    ],
    [
      users.femifemi,
      5,
      "This should be required reading everywhere, not just in African schools. The perspective it offers is irreplaceable.",
    ],
    [
      users.kynn1,
      4,
      "Beautifully written. The tragedy feels inevitable which makes it hit harder. Okonkwo is a deeply complex character.",
    ],
    [
      users.gentlesoul1,
      5,
      "Read it first in secondary school and it hit differently as an adult. Richer and more painful the second time.",
    ],
  ],
};

const calculateAvgRating = (reviews) => {
  const total = reviews.reduce((sum, [, star]) => sum + star, 0);
  return parseFloat((total / reviews.length).toFixed(2));
};

const main = async () => {
  console.log("Seeding reviews for existing books...");

  for (const [bookId, reviews] of Object.entries(reviewsMap)) {
    for (const [createdById, star, comment] of reviews) {
      await prisma.reviews.upsert({
        where: { bookId_createdById: { bookId, createdById } },
        update: { star, comment },
        create: { bookId, createdById, star, comment },
      });
    }

    await prisma.books.update({
      where: { id: bookId },
      data: {
        reviewCount: reviews.length + 1, // +1 for the existing review already in DB
        avgRating: calculateAvgRating(reviews),
      },
    });

    console.log(`Updated reviews for book ${bookId}`);
  }

  console.log("Creating new books and their reviews...");

  const bookTitles = [
    "atomicHabits",
    "pragmaticProgrammer",
    "deepWork",
    "thingsFallApart",
  ];

  for (let i = 0; i < newBooks.length; i++) {
    const bookData = newBooks[i];
    const reviewKey = bookTitles[i];
    const reviews = newBookReviews[reviewKey];

    const book = await prisma.books.create({
      data: {
        ...bookData,
        reviewCount: reviews.length,
        avgRating: calculateAvgRating(reviews),
      },
    });

    console.log(`Created book: ${book.title}`);

    for (const [createdById, star, comment] of reviews) {
      await prisma.reviews.create({
        data: { bookId: book.id, createdById, star, comment },
      });
    }

    console.log(`Seeded ${reviews.length} reviews for ${book.title}`);
  }

  console.log("Seeding complete.");
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
