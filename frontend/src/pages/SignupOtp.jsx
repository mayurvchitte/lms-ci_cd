import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { ClipLoader } from 'react-spinners';

const OTP_DURATION = 2 * 60 * 1000; // 2 minutes in ms
const MAX_RESEND = 2;

function SignupOtp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [expired, setExpired] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [resending, setResending] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { name, email, password, role } = location.state || {};

  // Initialize timer from sessionStorage
  useEffect(() => {
    const storedStart = sessionStorage.getItem(`otpStart_${email}`);
    const storedResend = sessionStorage.getItem(`otpResend_${email}`);
    setResendCount(storedResend ? parseInt(storedResend, 10) : 0);

    let startTime;
    if (!storedStart) {
      startTime = Date.now();
      sessionStorage.setItem(`otpStart_${email}`, startTime);
    } else {
      startTime = parseInt(storedStart, 10);
    }

    const remainingTime = Math.max(0, OTP_DURATION - (Date.now() - startTime));
    setTimeLeft(Math.floor(remainingTime / 1000));
    if (remainingTime <= 0) setExpired(true);
  }, [email]);

  // Countdown timer
  useEffect(() => {
    if (expired) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [expired]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleVerify = async () => {
    if (expired) return toast.error("OTP expired. Please request a new one.");
    if (!otp) return toast.error("Please enter OTP");

    setLoading(true);
    try {
      await axios.post(
        `${serverUrl}/api/auth/signup/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );

      const res = await axios.post(
        `${serverUrl}/api/auth/signup`,
        { email, password },
        { withCredentials: true }
      );

      dispatch(setUserData(res.data.user));
      toast.success("Signup successful!");

      // Clean OTP sessionStorage
      sessionStorage.removeItem(`otpStart_${email}`);
      sessionStorage.removeItem(`otpResend_${email}`);

      setTimeout(() => {
        navigate("/");
      }, 100);

    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCount >= MAX_RESEND) {
      return toast.error("Resend limit reached");
    }

    setResending(true);
    try {
      await axios.post(`${serverUrl}/api/auth/signup/send-otp`, { name, email, role });

      const newCount = resendCount + 1;
      setResendCount(newCount);
      sessionStorage.setItem(`otpResend_${email}`, newCount);
      sessionStorage.setItem(`otpStart_${email}`, Date.now());

      setTimeLeft(OTP_DURATION / 1000);
      setExpired(false);
      toast.success("OTP resent successfully");

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Enter OTP</h2>
        <p className="text-sm text-gray-500 mb-2 text-center">
          OTP sent to <b>{email}</b>
        </p>

        {!expired ? (
          <p className="text-sm text-center text-green-600 mb-4">
            OTP expires in {formatTime(timeLeft)}
          </p>
        ) : (
          <p className="text-sm text-center text-red-600 mb-4">
            OTP has expired. Please request a new one.
          </p>
        )}

        <input
          type="text"
          value={otp}
          disabled={expired}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black mb-4 disabled:bg-gray-100"
        />

        <button
          onClick={handleVerify}
          disabled={loading || expired}
          className="w-full bg-black hover:bg-gray-800 text-white py-2 px-4 rounded-md font-medium disabled:opacity-50"
        >
          {loading ? <ClipLoader size={20} color="white" /> : "Verify OTP"}
        </button>

        {expired && (
          <button
            onClick={handleResend}
            disabled={resendCount >= MAX_RESEND || resending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium mt-2 disabled:opacity-50"
          >
            {resending ? <ClipLoader size={20} color="white" /> : resendCount >= MAX_RESEND ? "Resend Limit Reached" : "Resend OTP"}
          </button>
        )}

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
