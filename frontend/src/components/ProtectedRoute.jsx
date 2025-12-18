import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { userData, isFetchingUser } = useSelector((state) => state.user);
  const location = useLocation();

  // Show loader while fetching user
  if (isFetchingUser) {
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        Loading...
      </div>
    );
  }
  // ⛔ Not logged in → send to login, BUT remember where they came from
  if (!userData) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}  // ⭐ this is what Login will read
        replace
      />
    );
  }

  // ⛔ Logged in but role not allowed
  if (allowedRoles && !allowedRoles.includes(userData.role)) {
    return <Navigate to="/" replace />;
  }

  // If not logged in or role not allowed, redirect to login
  // if (!userData || (allowedRoles && !allowedRoles.includes(userData.role))) {
  //   return (
  //     <Navigate
  //       to="/login"
  //       state={{ from: location }} // Save attempted URL
  //       replace={true}            // Replace to avoid history loop
  //     />
  //   );
  // }

  return children;
};

export default ProtectedRoute;