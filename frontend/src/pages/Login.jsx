// src/pages/Login.jsx
import React, { useState } from 'react';
import logo from '../assets/apical logo.jpg';
import google from '../assets/google.jpg';
import axios from 'axios';
import { serverUrl } from '../App';
import { MdOutlineRemoveRedEye, MdRemoveRedEye } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { clearRedirectPath } from '../redux/redirectSlice';
import { GoogleLogin } from '@react-oauth/google';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // ✅ read redirect target from Redux
  const redirectPath = useSelector((state) => state.redirect.path);
  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get("redirect");
  const stateFrom = location.state?.from?.pathname;

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      dispatch(setUserData(result.data));
      toast.success("Login Successfully");

      // 🎯 Priority: stateFrom (from ProtectedRoute) > redirectParam > redirectPath > "/"
      const target = stateFrom || redirectParam || redirectPath || "/";

      dispatch(clearRedirectPath());  // reset after using it
      navigate(target, { replace: true });
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
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

          {/* Back Arrow Button */}
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

          <GoogleLogin
              onSuccess={async (credentialResponse) => {
               setLoading(true);
               try {
                 const result = await axios.post(
                `${serverUrl}/api/auth/google/token`,
                  {
                   token: credentialResponse.credential,
                      },
                   { withCredentials: true }
                  );

                 dispatch(setUserData(result.data));
                 toast.success("Login successfully");

               const target = redirectPath || "/";
                dispatch(clearRedirectPath());
                navigate(target, { replace: true });
                 } catch (error) {
                console.log(error);
                toast.error("Google login failed");
              } finally {
                setLoading(false);
              }
               }}
            onError={() => {
              toast.error("Google login failed");
              }} />

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
          <img src={logo} className='w-30 shadow-2xl' alt="TechSproutLMS Logo" />
          <span className='text-[white] text-2xl'>TechSproutLMS</span>
        </div>
      </form>
    </div>
  );
}

export default Login;