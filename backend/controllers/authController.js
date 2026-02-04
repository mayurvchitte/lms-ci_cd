import { genToken } from "../configs/token.js"
import validator from "validator"

import bcrypt from "bcryptjs"
import User from "../models/userModel.js"

import sendMail from "../configs/Mail.js"
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const signUp = async (req, res) => {
  try {
    const { email, password } = req.body;

    const session = global.signupOtps?.[email];

    if (!session || !session.verified) {
      return res.status(400).json({ message: "OTP verification required" });
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create user in DB
    const user = await User.create({
      name: session.name,
      email,
      password: hashPassword,
      role: session.role
    });

    // Remove temporary OTP
    delete global.signupOtps[email];

    // Generate token
    const token = await genToken(user._id);

    res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
   });

    return res.status(201).json({ message: "Signup successful", user });

  } catch (error) {
    console.error("signUp error:", error);
    return res.status(500).json({ message: "Signup error " + error });
  }
};

export const login=async(req,res)=>{
    try {
        let {email,password}= req.body
        let user= await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"user does not exist"})
        }
        let isMatch =await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({message:"incorrect Password"})
        }
        let token =await genToken(user._id)
                // Update lastLoginAt on successful login
                try {
                    user.lastLoginAt = Date.now()
                    // If user was previously deactivated, do not automatically reactivate unless desired.
                    // We'll keep isActive as-is here, but ensure it exists for older docs.
                    if (typeof user.isActive === 'undefined') user.isActive = true
                    await user.save()
                } catch (e) {
                    console.warn('Failed to update lastLoginAt:', e)
                }

               res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Lax",
                maxAge: 7 * 24 * 60 * 60 * 1000
               });

        return res.status(200).json(user)

    } catch (error) {
        console.log("login error")
        return res.status(500).json({message:`login Error ${error}`})
    }
}




export const logOut = async(req,res)=>{
    try {
        // Clear cookie with same options as set cookie
        res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        });

        return res.status(200).json({message:"logOut Successfully"})
    } catch (error) {
        return res.status(500).json({message:`logout Error ${error}`})
    }
}


export const googleSignup = async (req,res) => {
    try {
        const {name , email , role} = req.body
        let user= await User.findOne({email})
        if(!user){
            user = await User.create({
            name , email ,role
        })
        }
                // Update lastLoginAt and ensure isActive exists
                try {
                    user.lastLoginAt = Date.now()
                    if (typeof user.isActive === 'undefined') user.isActive = true
                    await user.save()
                } catch (e) {
                    console.warn('Failed to update lastLoginAt for googleSignup:', e)
                }

                let token = await genToken(user._id)

                res.cookie("token", token, {
                httpOnly: true,
                 secure: process.env.NODE_ENV === "production",
                 sameSite: "Lax",
                maxAge: 7 * 24 * 60 * 60 * 1000
                 });

                 return res.status(200).json(user)

              } catch (error) {
        console.log(error)
         return res.status(500).json({message:`googleSignup  ${error}`})
    }
    
}

export const sendOtp = async (req,res) => {
    try {
        const {email} = req.body
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString()

        user.resetOtp=otp,
        user.otpExpires=Date.now() + 5*60*1000,
        user.isOtpVerified= false 

        await user.save()
        await sendMail(email,otp)
        return res.status(200).json({message:"Email Successfully send"})
    } catch (error) {

        return res.status(500).json({message:`send otp error ${error}`})
        
    }
}

export const verifyOtp = async (req,res) => {
    try {
        const {email,otp} = req.body
        const user = await User.findOne({email})
        if(!user || user.resetOtp!=otp || user.otpExpires<Date.now() ){
            return res.status(400).json({message:"Invalid OTP"})
        }
        user.isOtpVerified=true
        user.resetOtp=undefined
        user.otpExpires=undefined
        await user.save()
        return res.status(200).json({message:"OTP varified "})


    } catch (error) {
         return res.status(500).json({message:`Varify otp error ${error}`})
    }
}

export const resetPassword = async (req,res) => {
    try {
        const {email ,password } =  req.body
         const user = await User.findOne({email})
        if(!user || !user.isOtpVerified ){
            return res.status(404).json({message:"OTP verfication required"})
        }

        const hashPassword = await bcrypt.hash(password,10)
        user.password = hashPassword
        user.isOtpVerified=false
        await user.save()
        return res.status(200).json({message:"Password Reset Successfully"})
    } catch (error) {
        return res.status(500).json({message:`Reset Password error ${error}`})
    }
}

export const googleTokenExchange = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Google token missing" });
    }

    // ✅ Verify Google ID Token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const {
      email,
      name,
      picture,
      sub: googleId,
    } = payload;

    // 🔍 Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        role: "student",
        googleId,
        provider: "google",
        isVerified: true,
      });
    }

    // Update login info
    user.lastLoginAt = Date.now();
    if (typeof user.isActive === "undefined") user.isActive = true;
    await user.save();

    // 🔐 Generate JWT
    const jwtToken = await genToken(user._id);

    // 🍪 Set cookie
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json(user);

  } catch (error) {
    console.error("Google login failed:", error);
    return res.status(500).json({ message: "Google login failed" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP and expiration
    user.resetOtp = otp; // optional: hash for security
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.isOtpVerified = false;

    await user.save();

    // Send OTP via email
    await sendMail(
  email,
  "Password Reset OTP",
  `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 10 minutes.</p>`
  );


    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    return res.status(500).json({ message: `Forgot password error: ${error}` });
  }
};

export const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.resetOtp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;

    await user.save();

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    return res.status(500).json({ message: `OTP verification error: ${error}` });
  }
};

export const forgotPasswordReset = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.isOtpVerified) {
      return res.status(400).json({ message: "OTP verification required" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    user.password = hashPassword;
    user.isOtpVerified = false;

    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Password reset error: ${error}` });
  }
};

export const sendSignupOtp = async (req, res) => {
  try {
    const { email, name, role } = req.body;

    if (!name || !role || !email) {
      return res.status(400).json({ message: "Name, email, and role are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    global.signupOtps = global.signupOtps || {};
    const existingSession = global.signupOtps[email];

    // 🔒 RESEND LIMIT
    if (existingSession) {
      if (existingSession.resendCount >= 2) {
        return res.status(429).json({ message: "OTP resend limit reached. Please try again later." });
      }

      // Increment resend count and generate new OTP
      existingSession.resendCount += 1;
      existingSession.otp = Math.floor(100000 + Math.random() * 900000).toString();
      existingSession.expires = Date.now() + 5 * 60 * 1000; // 5 minutes
      existingSession.verified = false;

      await sendMail(
        email,
        "Signup OTP",
        `<p>Your OTP is <b>${existingSession.otp}</b>. It expires in 5 minutes.</p>`
      );

      return res.status(200).json({ message: "OTP resent successfully" });
    }

    // 🆕 First OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    global.signupOtps[email] = {
      name,
      role,
      otp,
      expires: Date.now() + 5 * 60 * 1000,
      verified: false,
      resendCount: 0
    };

    await sendMail(
      email,
      "Signup OTP",
      `<p>Your OTP is <b>${otp}</b>. It expires in 5 minutes.</p>`
    );

    return res.status(200).json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error("sendSignupOtp error:", error);
    return res.status(500).json({ message: "Signup OTP error " + error });
  }
};

export const verifySignupOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const session = global.signupOtps?.[email];

    if (!session) {
      return res.status(400).json({ message: "OTP not found. Please request again." });
    }

    if (session.expires < Date.now()) {
      delete global.signupOtps[email];
      return res.status(400).json({ message: "OTP expired" });
    }

    if (session.otp !== otp.trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark OTP verified
    session.verified = true;

    return res.status(200).json({ message: "OTP verified successfully" });

  } catch (error) {
    console.error("verifySignupOtp error:", error);
    return res.status(500).json({ message: "Verify signup OTP error " + error });
  }
};

// 🧹 Auto-clean expired OTPs (add this in server.js)
setInterval(() => {
  if (!global.signupOtps) return;
  const now = Date.now();
  for (const email in global.signupOtps) {
    if (global.signupOtps[email].expires < now) {
      delete global.signupOtps[email];
    }
  }
}, 60 * 1000); // every minute
