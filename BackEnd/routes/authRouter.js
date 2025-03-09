import express from 'express';
import {deleteUser, forgotPassword, getUser, login, logout, register, resetPassword, updatePassword, verifyOTP} from "../controllers/authController.js"
import { isAuthenticated } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUser);
router.get("/deleteUser",deleteUser)
router.post("/password/forgot",forgotPassword);
router.put("/password/reset/:token",resetPassword);
router.put("/password/update", isAuthenticated, updatePassword);
export default router;