import { Router } from "express";
import { register, login } from "../controllers/authController";
import { auth } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import { authSchemas } from "../middleware/validation";

const router = Router();

// Public routes
router.post("/register", validateRequest(authSchemas.register), register);
router.post("/login", validateRequest(authSchemas.login), login);

// Protected routes
// router.get("/profile", auth, getProfile);
// router.post("/register", register);

// // User Login
// router.post("/login", login);
export default router;
