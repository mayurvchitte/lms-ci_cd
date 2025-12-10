import { genToken } from "../configs/token.js"
import validator from "validator"

import bcrypt from "bcryptjs"
import User from "../models/userModel.js"

import sendMail from "../configs/Mail.js"


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
      secure: false,
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

                res.cookie("token",token,{
            httpOnly:true,
            secure:false,
            sameSite: "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
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
            secure: false,
            sameSite: "Lax",
        })
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

                let token =await genToken(user._id)
        res.cookie("token",token,{
            httpOnly:true,
            secure:false,
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
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

export const googleTokenExchange = async (req,res) => {
    try {
        const { code, redirect_uri } = req.body;
        console.log('Backend: Received Google code for exchange:', code ? 'present' : 'missing');

        // Exchange code for tokens with Google
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: redirect_uri,
            }),
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('Backend: Google token exchange failed:', tokenResponse.status, errorText);
            throw new Error('Failed to exchange code for token');
        }

        const tokens = await tokenResponse.json();
        console.log('Backend: Google tokens received successfully');

        // Get user info using the access token
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${tokens.access_token}`
            }
        });

        if (!userInfoResponse.ok) {
            console.error('Backend: Failed to fetch user info:', userInfoResponse.status);
            throw new Error('Failed to get user info');
        }

        const userInfo = await userInfoResponse.json();
        console.log('Backend: User info fetched:', { name: userInfo.name, email: userInfo.email });

        // Check if user exists, if not create one
        let user = await User.findOne({ email: userInfo.email });
        if (!user) {
            user = await User.create({
                name: userInfo.name,
                email: userInfo.email,
                role: "student", // default role
            });
            console.log('Backend: New user created with email:', userInfo.email);
        } else {
            console.log('Backend: Existing user found with email:', userInfo.email);
        }

        // Generate JWT token
        const token = await genToken(user._id);

                // Update lastLoginAt and ensure isActive exists
                try {
                    user.lastLoginAt = Date.now()
                    if (typeof user.isActive === 'undefined') user.isActive = true
                    await user.save()
                } catch (e) {
                    console.warn('Failed to update lastLoginAt for googleTokenExchange:', e)
                }

                // Set cookie
                res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        console.log('Backend: JWT set and response sent for user:', user._id);
        return res.status(200).json({
            user: user,
            access_token: tokens.access_token
        });

    } catch (error) {
        console.error('Backend: Google token exchange error:', error);
        return res.status(500).json({ message: `Google authentication failed: ${error.message}` });
    }
}

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

    // Check if user already exists in DB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in memory
    global.signupOtps = global.signupOtps || {};
    global.signupOtps[email] = {
      name,
      role,
      otp,
      expires: Date.now() + 5 * 60 * 1000, // 5 min
      verified: false
    };

    // Send OTP email
    await sendMail(
      email,
      "Signup OTP",
      `<p>Your OTP for signup is <b>${otp}</b>. It expires in 5 minutes.</p>`
    );

    return res.status(200).json({ message: "OTP sent for signup" });

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
