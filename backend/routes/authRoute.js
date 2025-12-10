import express from "express"
import { googleTokenExchange, login, logOut, resetPassword, sendOtp, signUp, verifyOtp, forgotPassword, verifyForgotPasswordOtp,forgotPasswordReset,sendSignupOtp,verifySignupOtp  } from "../controllers/authController.js"

const authRouter = express.Router()

authRouter.post("/signup",signUp)

authRouter.post("/login",login)
authRouter.get("/logout",logOut)
authRouter.post("/google/token", googleTokenExchange)
authRouter.post("/sendotp",sendOtp)
authRouter.post("/verifyotp",verifyOtp)
authRouter.post("/resetpassword",resetPassword)
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-forgot-password-otp", verifyForgotPasswordOtp);
authRouter.post("/forgot-password-reset", forgotPasswordReset);
authRouter.post("/signup/send-otp", sendSignupOtp);
authRouter.post("/signup/verify-otp", verifySignupOtp);


export default authRouter
