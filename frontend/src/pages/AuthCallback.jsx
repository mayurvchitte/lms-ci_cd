import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogleAuthService from "../../utils/GoogleAuth";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { clearRedirectPath } from "../redux/redirectSlice";

const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  // ✅ Fallback redirect path from Redux
  const redirectPath = useSelector((state) => state.redirect.path);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const error = urlParams.get("error");
        const state = urlParams.get("state");

        let parsedState = null;
        if (state) {
          try {
            parsedState = JSON.parse(state);
          } catch (err) {
            console.warn("Failed to parse state parameter:", err);
          }
        }

        // priority: state.from.pathname → Redux.redirectPath → "/"
        const finalRedirectPath =
          parsedState?.from?.pathname || redirectPath || "/";

        if (error) {
          toast.error("Google authentication was cancelled");
          navigate("/login");
          return;
        }

        if (!code) {
          toast.error("No authorization code received");
          navigate("/login");
          return;
        }

        const data = await GoogleAuthService.handleCallback(code);

        // Assume API returns { user: {...}, token?: ... }
        dispatch(setUserData(data.user));
        toast.success("Successfully signed in with Google!");

        // ✅ clear redirectPath and navigate
        dispatch(clearRedirectPath());
        navigate(finalRedirectPath, { replace: true });
      } catch (err) {
        console.error("Auth callback error:", err);
        toast.error(err.message || "Authentication failed");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate, dispatch, redirectPath]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ClipLoader size={50} />
          <p className="mt-4 text-gray-600">
            Authenticating with Google, please wait...
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;