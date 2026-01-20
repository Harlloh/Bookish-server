export const validateRequests = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body)

        if (!result.success) {
            const formated = result.error.format();

            const flatError = Object.values(formated).flat().filter(Boolean).map(err => err._errors).flat();

            console.log(flatError, formated);

            return res.status(405).json({ message: flatError.join(', ') });
        }
        next()
    }
}