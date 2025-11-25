import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String
      
    },
    description: {
      type: String
    },
    role: {
      type: String,
      enum: ["admin", "educator", "student"],
      required: true
    },
    photoUrl: {
      type: String,
      default: ""
    },
    enrolledCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }],
    wishlistCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }],
    resetOtp:{
      type:String
    },
    otpExpires:{
      type:Date
    },
    isOtpVerifed:{
      type:Boolean,
      default:false
    },
    violations: [{
      lectureId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lecture'
      },
      violationType: {
        type: String,
        enum: ['screenshot', 'screen_recording', 'copy', 'print', 'dev_tools']
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
    ,
    // When true the server will treat the user's token as invalid and force logout
    forceLogout: {
      type: Boolean,
      default: false
    },
    // Optional time until which forceLogout applies; if set and in the past the flag can be cleared
    forceLogoutUntil: {
      type: Date,
      default: null
    }
    ,
    // Track last login time for activity checks
    lastLoginAt: {
      type: Date,
      default: null
    },
    // Allow admin to mark users active/inactive
    isActive: {
      type: Boolean,
      default: true
    }

  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
