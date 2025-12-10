import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { ClipLoader } from 'react-spinners';

function SignupOtp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Values passed from SignUp.jsx  
  const { name, email, password, role } = location.state || {};

  // Redirect if no signup info
  useEffect(() => {
    if (!email || !name || !password || !role) {
      navigate("/signup");
    }
  }, [email, name, password, role, navigate]);

  const handleVerify = async () => {
    if (!otp.trim()) {
      return toast.error("Please enter OTP");
    }

    setLoading(true);
    try {
      // Step 1: Verify OTP
      await axios.post(
        `${serverUrl}/api/auth/signup/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );

      // Step 2: Complete signup
      const res = await axios.post(
        `${serverUrl}/api/auth/signup`,
        { name, email, password, role }, // include all required info
        { withCredentials: true }
      );

      // Step 3: Save user data in Redux
      dispatch(setUserData(res.data.user));

      toast.success("Signup successful!");

      // Step 4: Redirect based on role
      if (res.data.user.role === "student") navigate("/");
      else if (res.data.user.role === "educator") navigate("/dashboard");
      else if (res.data.user.role === "admin") navigate("/admin/dashboard");

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Enter OTP for Signup
        </h2>

        <p className="text-sm text-gray-500 mb-4 text-center">
          We have sent a 6-digit OTP to your email <b>{email}</b>
        </p>

        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black mb-4"
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-black hover:bg-gray-800 text-white py-2 px-4 rounded-md font-medium flex items-center justify-center"
        >
          {loading ? <ClipLoader size={20} color="white" /> : "Verify OTP"}
        </button>

        <div
          className="text-sm text-center mt-4 cursor-pointer text-gray-600 hover:text-gray-900"
          onClick={() => navigate("/signup")}
        >
          Back to Signup
        </div>
      </div>
    </div>
  );
}

export default SignupOtp;
