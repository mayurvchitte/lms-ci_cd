import React, { useState } from 'react';
import logo from '../assets/logo.jpeg';
import google from '../assets/google.jpg';
import axios from 'axios';
import { serverUrl } from '../App';
import { MdOutlineRemoveRedEye, MdRemoveRedEye } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5"; // added back arrow icon
import { useNavigate, useLocation } from 'react-router-dom';
import GoogleAuthService from '../../utils/GoogleAuth';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Save the path user wanted to visit before login
  const redirectPath = location.state?.from?.pathname || "/";

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      dispatch(setUserData(result.data));
      setLoading(false);
      toast.success("Login Successfully");

      // Redirect to the page user wanted
      navigate(redirectPath, { replace: true }); // replace keeps history clean
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  const googleLogin = async () => {
    setLoading(true);
    try {
      const authUrl = GoogleAuthService.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error("Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className='bg-[#dddbdb] w-[100vw] h-[100vh] flex items-center justify-center flex-col gap-3'>
      <form
        className='w-[90%] md:w-200 h-150 bg-[white] shadow-xl rounded-2xl flex relative'
        onSubmit={(e) => e.preventDefault()}
      >
        {/* Left Side (Form Section) */}
        <div className='md:w-[50%] w-[100%] h-[100%] flex flex-col items-center justify-center gap-4 relative'>

          {/* 👇 Back Arrow Button */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="absolute top-5 left-5 text-black flex items-center gap-1 hover:text-gray-700 transition-all"
          >
            <IoArrowBack size={24} />
            <span className="text-sm font-medium hidden sm:inline">Home</span>
          </button>

          <div className='mt-8'>
            <h1 className='font-semibold text-[black] text-2xl'>Welcome back</h1>
            <h2 className='text-[#999797] text-[18px]'>Login to your account</h2>
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

          <button
            className='w-[80%] h-[40px] bg-black text-white cursor-pointer flex items-center justify-center rounded-[5px]'
            disabled={loading}
            onClick={handleLogin}
          >
            {loading ? <ClipLoader size={30} color='white' /> : "Login"}
          </button>

          <span
            className='text-[13px] cursor-pointer text-[#585757]'
            onClick={() => navigate("/forgotpassword")}
          >
            Forget your password?
          </span>

          <div className='w-[80%] flex items-center gap-2'>
            <div className='w-[25%] h-[0.5px] bg-[#c4c4c4]'></div>
            <div className='w-[50%] text-[15px] text-[#999797] flex items-center justify-center'>
              Or continue with
            </div>
            <div className='w-[25%] h-[0.5px] bg-[#c4c4c4]'></div>
          </div>

          <div
            className='w-[80%] h-[40px] border-1 border-[#d3d2d2] rounded-[5px] flex items-center justify-center cursor-pointer'
            onClick={googleLogin}
          >
            <img src={google} alt="" className='w-[25px]' />
            <span className='text-[18px] text-gray-500'>Google</span>
          </div>

          <div className='text-[#6f6f6f]'>
            Don't have an account?{" "}
            <span
              className='underline underline-offset-1 text-[black] cursor-pointer'
              onClick={() => navigate("/signup")}
            >
              Sign up
            </span>
          </div>
        </div>

        {/* Right Side (Logo Section) */}
        <div className='w-[50%] h-[100%] rounded-r-2xl bg-[black] md:flex items-center justify-center flex-col hidden'>
          <img src={logo} className='w-30 shadow-2xl' alt="Logo" />
          <span className='text-[white] text-2xl'>SKILL SPHERE</span>
        </div>
      </form>
    </div>
  );
}

export default Login;
