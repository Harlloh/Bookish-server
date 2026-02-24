import { string, z } from 'zod';


export const addToBooksSchema = z.object({
    title: z.string().min(3, "Title is required"),
    author: z.string().min(3, "Author is required"),
    publishedYear: z.coerce
        .number()
        .int()
        .min(1000)
        .max(new Date().getFullYear()),
    overview: z.string().optional().or(z.literal(""))
})