import e from "express"
import { custom } from "zod"

export const successResponse = (status, res, data, message) => {
    return res.status(status).json({
        success: true,
        message,
        data,
    })
}

export const errorResponse = (status, res, message, errDetails) => {
    return res.status(status).json({
        success: false,
        message,
        error: errDetails
    })
}