import React, { useState } from 'react'
import logo from '../assets/apical logo.jpg'
import google from '../assets/google.jpg'
import axios from 'axios'
import { serverUrl } from '../App'
import { MdOutlineRemoveRedEye, MdRemoveRedEye } from "react-icons/md";
import { useNavigate } from 'react-router-dom'
import GoogleAuthService from '../../utils/GoogleAuth'
import { ClipLoader } from 'react-spinners'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'
import { IoArrowBack } from 'react-icons/io5'

function SignUp() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("student")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

 const handleSignUp = async () => {
  if (!name.trim() || !email.trim() || !password.trim() || !role) {
    return toast.error("Please fill all fields and select a role");
  }

  setLoading(true);
  try {
    // Send ONLY email to the send-otp endpoint
    await axios.post(`${serverUrl}/api/auth/signup/send-otp`, { name, email, role });
    // ✅ 2️⃣ START OTP SESSION HERE (THIS IS THE FIX)
    sessionStorage.removeItem(`otpStart_${email}`);
    sessionStorage.removeItem(`otpResend_${email}`);
    sessionStorage.setItem(`otpStart_${email}`, Date.now());

    toast.success("OTP sent to your email");

    // Pass the other info to OTP page via state
    navigate("/signup-otp", { state: { name, email, password, role } });
  } catch (error) {
    console.log(error.response);
    toast.error(error.response?.data?.message || "Failed to send OTP");
  } finally {
    setLoading(false);
  }
};


  const googleSignUp = async () => {
    setLoading(true)
    try {
      sessionStorage.setItem('google_signup_role', role)
      const authUrl = GoogleAuthService.getAuthUrl()
      window.location.href = authUrl
    } catch (error) {
      console.log(error)
      setLoading(false)
      toast.error("Google sign-in failed. Please try again.")
    }
  }

  return (
    <div className='bg-[#dddbdb] w-[100vw] h-[100vh] flex items-center justify-center flex-col gap-3'>
      <form
        className='w-[90%] md:w-200 h-150 bg-[white] shadow-xl rounded-2xl flex relative'
        onSubmit={(e) => e.preventDefault()}
      >
        {/* Left Side */}
        <div className='md:w-[50%] w-[100%] h-[100%] flex flex-col items-center justify-center gap-3 relative'>
          
          {/* 👇 Back Button (goes to previous page) */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute top-5 left-5 text-black flex items-center gap-1 hover:text-gray-700 transition-all"
          >
            <IoArrowBack size={24} />
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </button>

          <div>
            <h1 className='font-semibold text-[black] text-2xl'>Let's get Started</h1>
            <h2 className='text-[#999797] text-[18px]'>Create your account</h2>
          </div>

          <div className='flex flex-col gap-1 w-[85%] items-start justify-center px-3'>
            <label htmlFor="name" className='font-semibold'>Name</label>
            <input
              id='name'
              type="text"
              className='border-1 w-[100%] h-[35px] border-[#e7e6e6] text-[15px] px-[20px]'
              placeholder='Enter your name'
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>

          <div className='flex flex-col gap-1 w-[85%] items-start justify-center px-3'>
            <label htmlFor="email" className='font-semibold'>Email</label>
            <input
              id='email'
              type="email"
              className='border-1 w-[100%] h-[35px] border-[#e7e6e6] text-[15px] px-[20px]'
              placeholder='Enter your email'
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>

          <div className='flex flex-col gap-1 w-[85%] items-start justify-center px-3 relative'>
            <label htmlFor="password" className='font-semibold'>Password</label>
            <input
              id='password'
              type={show ? "text" : "password"}
              className='border-1 w-[100%] h-[35px] border-[#e7e6e6] text-[15px] px-[20px]'
              placeholder='***********'
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            {!show ? (
              <MdOutlineRemoveRedEye
                className='absolute w-[20px] h-[20px] cursor-pointer right-[5%] bottom-[10%]'
                onClick={() => setShow(prev => !prev)}
              />
            ) : (
              <MdRemoveRedEye
                className='absolute w-[20px] h-[20px] cursor-pointer right-[5%] bottom-[10%]'
                onClick={() => setShow(prev => !prev)}
              />
            )}
          </div>

          <div className='flex md:w-[50%] w-[70%] items-center justify-between'>
            <span
              className={`px-[10px] py-[5px] border-[1px] border-[#e7e6e6] rounded-2xl cursor-pointer ${role === 'student' ? "border-black" : "border-[#646464]"}`}
              onClick={() => setRole("student")}
            >
              Student
            </span>
            <span
              className={`px-[10px] py-[5px] border-[1px] border-[#e7e6e6] rounded-2xl cursor-pointer ${role === 'educator' ? "border-black" : "border-[#646464]"}`}
              onClick={() => setRole("educator")}
            >
              Educator
            </span>
            <span
              className={`px-[10px] py-[5px] border-[1px] border-[#e7e6e6] rounded-2xl cursor-pointer ${role === 'admin' ? "border-black" : "border-[#646464]"}`}
              onClick={() => setRole("admin")}
            >
              Admin
            </span>
          </div>

          <button
            className='w-[80%] h-[40px] bg-black text-white cursor-pointer flex items-center justify-center rounded-[5px]'
            disabled={loading}
            onClick={handleSignUp}
          >
            {loading ? <ClipLoader size={30} color='white' /> : "Sign Up"}
          </button>

          <div className='w-[80%] flex items-center gap-2'>
            <div className='w-[25%] h-[0.5px] bg-[#c4c4c4]'></div>
            <div className='w-[50%] text-[15px] text-[#6f6f6f] flex items-center justify-center'>
              Or continue with
            </div>
            <div className='w-[25%] h-[0.5px] bg-[#c4c4c4]'></div>
          </div>

          <div
            className='w-[80%] h-[40px] border-1 border-[black] rounded-[5px] flex items-center justify-center cursor-pointer'
            onClick={googleSignUp}
          >
            <img src={google} alt="" className='w-[25px]' />
            <span className='text-[18px] text-gray-500'>Google</span>
          </div>

          <div className='text-[#6f6f6f]'>
            Already have an account?{" "}
            <span
              className='underline underline-offset-1 text-[black] cursor-pointer'
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </div>
        </div>

        {/* Right Side */}
        <div className='w-[50%] h-[100%] rounded-r-2xl bg-[black] md:flex items-center justify-center flex-col hidden'>
          <img src={logo} className='w-30 shadow-2xl' alt="TechSproutLMS Logo" />
          <span className='text-[white] text-2xl'>TechSproutLMS</span>
        </div>
      </form>
    </div>
  )
}

export default SignUp
