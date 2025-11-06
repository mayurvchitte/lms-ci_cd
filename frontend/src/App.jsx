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

import ScrollToTop from './components/ScrollToTop'
import { setUserData } from './redux/userSlice'
import './customHooks/useScreenshotPrevention'
import './utils/axiosSetup'
import useScreenshotPrevention from './customHooks/useScreenshotPrevention'

//export const serverUrl = "http://localhost:8000"
export const serverUrl = "http://72.60.219.208:8000"


function App() {
  const dispatch = useDispatch()
  const location = useLocation()
  const { userData, isFetchingUser } = useSelector(state => state.user)

  useScreenshotPrevention()

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
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
        <Route path='/login' element={!userData ? <Login /> : <Navigate to='/' />} />
        <Route path='/signup' element={!userData ? <SignUp /> : <Navigate to='/' />} />
        <Route path='/forgotpassword' element={<ForgotPassword />} />
        <Route path='/auth/callback' element={<AuthCallback />} />

        {/* Protected student routes */}
        <Route path='/profile' element={userData ? <Profile /> : <Navigate to='/login' />} />
        <Route path='/editprofile' element={userData ? <EditProfile /> : <Navigate to='/login' />} />
        <Route path='/allcourses' element={userData ? <AllCouses /> : <Navigate to='/login' />} />
        <Route path='/viewcourse/:courseId' element={userData ? <ViewCourse /> : <Navigate to='/login' />} />
        <Route path='/enrolledcourses' element={userData ? <EnrolledCourse /> : <Navigate to='/login' />} />
        <Route path='/viewlecture/:courseId' element={userData ? <ViewLecture /> : <Navigate to='/login' />} />
        <Route path='/live/:lectureId' element={userData ? <LiveStream /> : <Navigate to='/login' />} />
        <Route path='/searchwithai' element={userData ? <SearchWithAi /> : <Navigate to='/login' />} />
        <Route path='/wishlist' element={userData?.role === 'student' ? <Wishlist /> : <Navigate to='/login' />} />
        <Route path='/notifications' element={userData ? <Notifications /> : <Navigate to='/login' />} />

        {/* Educator routes */}
        <Route path='/dashboard' element={userData?.role === 'educator' ? <Dashboard /> : <Navigate to='/login' />} />
        <Route path='/courses' element={userData?.role === 'educator' ? <Courses /> : <Navigate to='/login' />} />
        <Route path='/addcourses/:courseId' element={userData?.role === 'educator' ? <AddCourses /> : <Navigate to='/login' />} />
        <Route path='/createcourses' element={userData?.role === 'educator' ? <CreateCourse /> : <Navigate to='/login' />} />
        <Route path='/createlecture/:courseId' element={userData?.role === 'educator' ? <CreateLecture /> : <Navigate to='/login' />} />
        <Route path='/editlecture/:courseId/:lectureId' element={userData?.role === 'educator' ? <EditLecture /> : <Navigate to='/login' />} />

        {/* Admin routes */}
        <Route path='/admin/dashboard' element={userData?.role === 'admin' ? <AdminDashboard /> : <Navigate to='/login' />} />
        <Route path='/admin/users' element={userData?.role === 'admin' ? <UserManagement /> : <Navigate to='/login' />} />
        <Route path='/admin/settings' element={userData?.role === 'admin' ? <SystemSettings /> : <Navigate to='/login' />} />
      </Routes>
    </>
  )
}

export default App

