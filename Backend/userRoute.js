import express from "express";
import { signupUser, verifyOtp, loginUser } from "./controllers/usercontroller.js";

const router = express.Router();

router.post("/signup", signupUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);

export default router;
