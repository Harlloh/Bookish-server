import express from "express";
import { getUserProfile } from "../config/controllers/profileControllers.js";

const router = express.Router()

router.get('/', getUserProfile)

export default router

