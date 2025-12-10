import React, { useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { ClipLoader } from 'react-spinners';

function SignupOtp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Values passed from SignUp.jsx  
  const { name, email, password, role } = location.state || {};

  const handleVerify = async () => {
    if (!otp) return toast.error("Please enter OTP");

    setLoading(true);
    try {
      // Step 1: Verify OTP
      await axios.post(
        `${serverUrl}/api/auth/signup/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );

      // Step 2: Complete signup + login
      const res = await axios.post(
        `${serverUrl}/api/auth/signup`,
        { email, password },
        { withCredentials: true }
      );

      // Step 3: Save user in Redux
      dispatch(setUserData(res.data));

      toast.success("Signup successful!");

      // Step 4: Redirect to home
      // Use window.location to force re-read of cookies and prevent blank page
      setTimeout(() => {
        window.location.replace("/");
      }, 100);

    } catch (err) {
      toast.error(err.response?.data?.message || "OTP error");
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
          className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[black] mb-4"
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-[black] hover:bg-[#4b4b4b] text-white py-2 px-4 rounded-md font-medium"
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
