import React, { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import axios from 'axios'

import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import Dashboard from './pages/admin/Dashboard'
import Courses from './pages/admin/Courses'
import AllCouses from './pages/AllCouses'
import AddCourses from './pages/admin/AddCourses'
import CreateCourse from './pages/admin/CreateCourse'
import CreateLecture from './pages/admin/CreateLecture'
import EditLecture from './pages/admin/EditLecture'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import SystemSettings from './pages/admin/SystemSettings'
import LiveStream from './components/LiveStream'
import Chatbot from './components/ChatBot'
import ViewCourse from './pages/ViewCourse'
import EnrolledCourse from './pages/EnrolledCourse'
import ViewLecture from './pages/ViewLecture'
import SearchWithAi from './pages/SearchWithAi'
import Wishlist from './pages/Wishlist'
import Notifications from './pages/Notifications'
import ForgotPassword from './pages/ForgotPassword'
import AuthCallback from './pages/AuthCallback'
import ProtectedRoute from './components/ProtectedRoute'
import SignupOtp from './pages/SignupOtp'

import ScrollToTop from './components/ScrollToTop'
import { setUserData, startFetchingUser } from './redux/userSlice'
import './customHooks/useScreenshotPrevention'
import './utils/axiosSetup'
import useScreenshotPrevention from './customHooks/useScreenshotPrevention'

export const serverUrl = "http://localhost:8000"
// // export const serverUrl = "http://72.60.219.208:8000"
//  export const serverUrl = "https://techsproutlms.com";

function App() {
  const dispatch = useDispatch()
  const location = useLocation()
  const { userData, isFetchingUser } = useSelector(state => state.user)

  useScreenshotPrevention()

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      dispatch(startFetchingUser())
      try {
        const res = await axios.get(serverUrl + '/api/user/currentuser', { withCredentials: true })
        dispatch(setUserData(res.data?.user || res.data))
      } catch (err) {
        dispatch(setUserData(null))
      }
    }
    fetchUser()
  }, [dispatch])

  // Prevent white page while fetching user
  if (isFetchingUser) {
    return <div className="flex items-center justify-center h-screen text-xl">Loading...</div>
  }

  // Detect if current page is a course/lecture page
  const isCoursePage = location.pathname.startsWith("/viewcourse") || location.pathname.startsWith("/viewlecture")

  return (
    <>
      <ToastContainer />
      <ScrollToTop />
      <div className="screenshot-overlay"></div>
      <div className="flash-overlay" id="flashOverlay"></div>

      {/* Show chatbot only for students outside course pages */}
      {userData?.role === "student" && !isCoursePage && <Chatbot isStudent={true} />}

      <Routes>
        {/* Public routes */}
        <Route path='/' element={<Home />} />
        // src/App.jsx
        <Route path="/login" element={<Login />} />
        <Route path='/signup' element={!userData ? <SignUp /> : <Navigate to='/' />} />
        <Route path='/forgotpassword' element={<ForgotPassword />} />
        <Route path='/auth/callback' element={<AuthCallback />} />

        
        {/* Signup OTP Routes */}
        <Route path="/signup-otp" element={<SignupOtp />} />

        {/* Protected student routes */}
        <Route path='/profile' element={
          <ProtectedRoute allowedRoles={['student', 'educator', 'admin']}><Profile /></ProtectedRoute>
        } />
        <Route path='/editprofile' element={
          <ProtectedRoute allowedRoles={['student', 'educator', 'admin']}><EditProfile /></ProtectedRoute>
        } />
        <Route path='/allcourses' element={
          <ProtectedRoute allowedRoles={['student', 'educator', 'admin']}><AllCouses /></ProtectedRoute>
        } />
        <Route path='/viewcourse/:courseId' element={
          <ProtectedRoute allowedRoles={['student', 'educator', 'admin']}><ViewCourse /></ProtectedRoute>
        } />
        <Route path='/enrolledcourses' element={
          <ProtectedRoute allowedRoles={['student']}><EnrolledCourse /></ProtectedRoute>
        } />
        <Route path='/viewlecture/:courseId' element={
          <ProtectedRoute allowedRoles={['student', 'educator']}><ViewLecture /></ProtectedRoute>
        } />
        <Route path='/live/:lectureId' element={
          <ProtectedRoute allowedRoles={['student', 'educator']}><LiveStream /></ProtectedRoute>
        } />
        <Route path='/searchwithai' element={
          <ProtectedRoute allowedRoles={['student']}><SearchWithAi /></ProtectedRoute>
        } />
        <Route path='/wishlist' element={
          <ProtectedRoute allowedRoles={['student']}><Wishlist /></ProtectedRoute>
        } />
        <Route path='/notifications' element={
          <ProtectedRoute allowedRoles={['student', 'educator', 'admin']}><Notifications /></ProtectedRoute>
        } />

        {/* Educator routes */}
        <Route path='/dashboard' element={
          <ProtectedRoute allowedRoles={['educator']}><Dashboard /></ProtectedRoute>
        } />
        <Route path='/courses' element={
          <ProtectedRoute allowedRoles={['educator']}><Courses /></ProtectedRoute>
        } />
        <Route path='/addcourses/:courseId' element={
          <ProtectedRoute allowedRoles={['educator']}><AddCourses /></ProtectedRoute>
        } />
        <Route path='/createcourses' element={
          <ProtectedRoute allowedRoles={['educator']}><CreateCourse /></ProtectedRoute>
        } />
        <Route path='/createlecture/:courseId' element={
          <ProtectedRoute allowedRoles={['educator']}><CreateLecture /></ProtectedRoute>
        } />
        <Route path='/editlecture/:courseId/:lectureId' element={
          <ProtectedRoute allowedRoles={['educator']}><EditLecture /></ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path='/admin/dashboard' element={
          <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
        } />
        <Route path='/admin/users' element={
          <ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>
        } />
        <Route path='/admin/settings' element={
          <ProtectedRoute allowedRoles={['admin']}><SystemSettings /></ProtectedRoute>
        } />
      </Routes>
    </>
  )
}

export default App
