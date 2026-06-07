import express from "express";
import { addUserRole, loginUser, myProfile } from "../controllers/auth.js";
import { isAuth } from "../middlewares/isAuth.js";
import { authLimiter } from "../middlewares/rateLimit.js";

const router = express.Router();

router.post("/login", authLimiter, loginUser);
router.put("/add/role", isAuth, addUserRole);
router.get("/me", isAuth, myProfile);

export default router;
