import React, { useState, useEffect } from 'react'
import logo from "../assets/logo.jpeg"
import ai from "../assets/ai.png"
import { IoMdPerson, IoMdNotifications } from "react-icons/io";
import { GiHamburgerMenu } from "react-icons/gi";
import { GiSplitCross } from "react-icons/gi";
import { FaHeart, FaBook, FaCreditCard } from "react-icons/fa";
import { MdLogout } from "react-icons/md";

import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData, setNotifications, markNotificationAsRead } from '../redux/userSlice';

function Nav() {
  let [showHam,setShowHam] = useState(false)
  let [showPro,setShowPro] = useState(false)
  let [showNotif,setShowNotif] = useState(false)
  let [isProcessingPayment, setIsProcessingPayment] = useState(false)
  let navigate = useNavigate()
  let dispatch = useDispatch()
  let {userData, notifications} = useSelector(state=>state.user)

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 90; // navbar height
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (userData) {
      fetchNotifications();
    }
  }, [userData]);

  const fetchNotifications = async () => {
    try {
      const result = await axios.get(serverUrl + "/api/user/notifications", {withCredentials: true});
      dispatch(setNotifications(result.data.notifications));
    } catch (error) {
      console.log(error);
    }
  };

  const handlePayment = async () => {
    if (isProcessingPayment) return
    setIsProcessingPayment(true)
    try {
      // Create order
      const orderData = await axios.post(serverUrl + "/api/payment/create-order", {
        courseId: userData.enrolledCourses.length > 0 ? userData.enrolledCourses[0] : null,
        userId: userData._id
      }, { withCredentials: true })

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.data.amount,
        currency: "INR",
        name: "skill Sphere",
        description: "Course Enrollment Payment",
        order_id: orderData.data.id,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(serverUrl + "/api/payment/verify-payment", {
              ...response,
              courseId: userData.enrolledCourses.length > 0 ? userData.enrolledCourses[0] : null,
              userId: userData._id
            }, { withCredentials: true })
            toast.success(verifyRes.data.message)
          } catch (verifyError) {
            toast.error("Payment verification failed.")
            console.error("Verification Error:", verifyError)
          }
        },
        modal: {
          ondismiss: () => setIsProcessingPayment(false)
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      toast.error("Something went wrong while processing payment.")
      console.error("Payment Error:", err)
      setIsProcessingPayment(false)
    }
  }

  const handleLogout = async () => {
    try {
      const result = await axios.get(serverUrl + "/api/auth/logout" , {withCredentials:true})
      console.log(result.data)
      await dispatch(setUserData(null))
      toast.success("LogOut Successfully")
      setShowPro(false)
      navigate("/")  // Redirect to home page after logout
      window.location.reload() // Reload to reset app state
    } catch (error) {
      console.log(error.response?.data?.message)
      toast.error(error.response?.data?.message || "Logout failed")
    }
  }

  const handleOptionClick = (path) => {
    navigate(path)
    setShowPro(false)
  }

  const handleMarkAsRead = async (id) => {
    if (!id) return;
    try {
      await axios.post(`${serverUrl}/api/user/notifications/${id}/read`, {}, {withCredentials: true});
      dispatch(markNotificationAsRead(id));
    } catch (error) {
      console.log(error);
    }
  }

  const closeDropdown = (e) => {
    if (e.target.closest('.profile-dropdown') || e.target.closest('.notification-dropdown')) return;
    setShowPro(false)
    setShowNotif(false)
  }

  return (
    <div onClick={closeDropdown}>
      <div className='w-[100%] h-[90px] fixed top-0 px-[20px] py-[10px] flex items-center justify-between bg-[#00000047]  z-[100]'>
        <div className='lg:w-[20%] w-[40%] lg:pl-[50px] flex items-center gap-6'>
          <img src={logo} className=' w-[80px] h-[80px] rounded-[5px] border-2 border-white cursor-pointer' onClick={() => navigate("/")} alt="SkillSphere Logo" />
          <div className='hidden lg:flex items-center gap-4'>
            <span className='text-white cursor-pointer hover:text-gray-300 transition-colors' onClick={() => scrollToSection('explore-courses')}>Home</span>
            <span className='text-white cursor-pointer hover:text-gray-300 transition-colors' onClick={() => scrollToSection('about-us')}>AboutUs</span>
            <span className='text-white cursor-pointer hover:text-gray-300 transition-colors' onClick={() => scrollToSection('contact-us')}>ContactUs</span>
          </div>
        </div>

        <div className='w-[30%] lg:flex items-center justify-center gap-4 hidden'>
          {!userData ? (
            <>
              <div className='relative'>
                <IoMdPerson className='w-[50px] h-[50px] fill-white cursor-pointer border-[2px] border-[#fdfbfb] bg-[#000000d5] rounded-full p-[10px]' onClick={(e) => { e.stopPropagation(); setShowPro(prev => !prev) }} />
                {showPro && (
                  <div className='profile-dropdown absolute top-full right-0 mt-2 w-48 bg-black border-2 border-white rounded-lg shadow-lg z-20'>
                    <div className='px-4 py-2 text-white cursor-pointer hover:bg-gray-700 rounded' onClick={() => handleOptionClick("/login")}>Login</div>
                  </div>
                )}
              </div>
              <div className='px-[20px] py-[10px] border-2 lg:border-white border-black lg:text-white bg-black text-white rounded-[10px] text-[18px] font-light cursor-pointer' onClick={() => navigate("/login")}>Login</div>
            </>
          ) : (
            <>
              <button className='px-[20px] py-[10px] lg:bg-white bg-black lg:text-black text-white rounded-[10px] text-[18px] font-light flex gap-2 cursor-pointer items-center justify-center' onClick={() => navigate("/searchwithai")}>Search with AI <img src={ai} className='w-[30px] h-[30px] rounded-full hidden lg:block' alt="" /></button>
              {userData?.role === "student" && (
                <>
                  <FaHeart className='w-[30px] h-[30px] fill-red-500 cursor-pointer' onClick={(e) => { e.stopPropagation(); navigate("/wishlist"); }} title="Wishlist" />
                  <div className='relative'>
                    <IoMdNotifications className='w-[30px] h-[30px] fill-white cursor-pointer' onClick={(e) => { e.stopPropagation(); setShowNotif(prev => !prev) }} title="Notifications" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                    {showNotif && (
                      <div className='notification-dropdown absolute top-full left-0 mt-2 w-64 bg-black border-2 border-white rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto'>
                        {notifications.length > 0 ? (
                          notifications.map(notif => (
                            <div key={notif._id} className={`px-4 py-2 text-white cursor-pointer hover:bg-gray-700 rounded ${!notif.read ? 'bg-gray-800' : ''}`} onClick={() => handleMarkAsRead(notif._id)}>
                              <p className='text-sm'>{notif.message}</p>
                              <p className='text-xs text-gray-400'>{new Date(notif.createdAt).toLocaleDateString()}</p>
                            </div>
                          ))
                        ) : (
                          <div className='px-4 py-2 text-white'>No notifications</div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
              <div className='relative'>
                <div className='w-[50px] h-[50px] rounded-full text-white flex items-center justify-center text-[20px] border-2 bg-black  border-white cursor-pointer' onClick={(e) => { e.stopPropagation(); setShowPro(prev => !prev) }}>
                  {userData.photoUrl ? <img src={userData.photoUrl} className='w-[100%] h-[100%] rounded-full object-cover' alt="" />
                    :
                    <div className='w-[50px] h-[50px] rounded-full text-white flex items-center justify-center text-[20px] border-2 bg-black  border-white cursor-pointer' >{userData?.name.slice(0, 1).toUpperCase()}</div>}
                </div>
                {showPro && (
                  <div className='profile-dropdown absolute top-full right-0 mt-2 w-48 bg-black border-2 border-white rounded-lg shadow-lg z-20'>
                    <div className='px-4 py-2 text-white cursor-pointer hover:bg-gray-700 rounded flex items-center gap-2' onClick={() => handleOptionClick("/profile")}>
                      <IoMdPerson className='w-[20px] h-[20px]' /> My Profile
                    </div>
                    <div className='px-4 py-2 text-white cursor-pointer hover:bg-gray-700 rounded flex items-center gap-2' onClick={() => handleOptionClick("/enrolledcourses")}>
                      <FaBook className='w-[20px] h-[20px]' /> My Courses
                    </div>
                    {userData?.role === "student" && (
                      <>
                        <div className='px-4 py-2 text-white cursor-pointer hover:bg-gray-700 rounded flex items-center gap-2' onClick={() => handleOptionClick("/wishlist")}>
                          <FaHeart className='w-[20px] h-[20px]' /> Wishlist
                        </div>
                        <button
                          className='px-4 py-2 w-full text-left text-white bg-green-600 hover:bg-green-700 rounded flex items-center gap-2'
                          onClick={() => {
                            setShowPro(false)
                            handlePayment()
                          }}
                          disabled={isProcessingPayment}
                        >
                          <FaCreditCard className='w-[20px] h-[20px]' /> {isProcessingPayment ? 'Processing...' : 'Make Payment'}
                        </button>
                      </>
                    )}
                    <div className='px-4 py-2 text-white cursor-pointer hover:bg-gray-700 rounded flex items-center gap-2' onClick={() => handleOptionClick("/notifications")}>
                      <IoMdNotifications className='w-[20px] h-[20px]' /> Notifications
                    </div>
                    <div className='px-4 py-2 text-white cursor-pointer hover:bg-gray-700 rounded flex items-center gap-2' onClick={handleLogout}>
                      <MdLogout className='w-[20px] h-[20px]' /> LogOut
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {userData?.role == "educator" ? <div className='px-[20px] py-[10px] border-2 lg:border-white border-black lg:text-white bg-black text-white rounded-[10px] text-[18px] font-light cursor-pointer' onClick={() => navigate("/dashboard")}>Dashboard</div> : null}
          {userData?.role == "admin" ? <div className='px-[20px] py-[10px] border-2 lg:border-white border-black lg:text-white bg-black text-white rounded-[10px] text-[18px] font-light cursor-pointer' onClick={() => navigate("/admin/dashboard")}>Admin Panel</div> : null}
        </div>
        <GiHamburgerMenu className='w-[30px] h-[30px] lg:hidden fill-white cursor-pointer ' onClick={() => setShowHam(prev => !prev)} />
      </div>
      <div className={`fixed  top-0 w-[100vw] h-[100vh] bg-[#000000d6] flex items-center justify-center flex-col gap-5 z-10 ${showHam ? "translate-x-[0%] transition duration-600  ease-in-out" : "translate-x-[-100%] transition duration-600  ease-in-out"}`}>
        <GiSplitCross className='w-[35px] h-[35px] fill-white absolute top-5 right-[4%]' onClick={() => setShowHam(prev => !prev)} />
        {!userData ? <IoMdPerson className='w-[50px] h-[50px] fill-white cursor-pointer border-[2px] border-[#fdfbfb7a] bg-[#000000d5] rounded-full p-[10px]' onClick={() => setShowPro(prev => !prev)} /> :
          <div className='w-[50px] h-[50px] rounded-full text-white flex items-center justify-center text-[20px] border-2 bg-black  border-white cursor-pointer' onClick={() => setShowPro(prev => !prev)}>
            {userData.photoUrl ? <img src={userData.photoUrl} className='w-[100%] h-[100%] rounded-full object-cover ' alt="" />
              :
              <div className='w-[50px] h-[50px] rounded-full text-white flex items-center justify-center text-[20px] border-2 bg-black  border-white cursor-pointer' >{userData?.name.slice(0, 1).toUpperCase()}</div>}</div>
        }

        <span className='flex items-center justify-center gap-2  text-white border-[2px] border-[#fdfbfb7a] bg-[#000000d5] rounded-lg px-[65px] py-[20px] text-[18px] ' onClick={() => { navigate("/profile"); setShowHam(false) }}>My Profile </span>
        <span className='flex items-center justify-center gap-2  text-white border-[2px] border-[#fdfbfb7a] bg-[#000000d5] rounded-lg px-[65px] py-[20px] text-[18px] ' onClick={() => { navigate("/enrolledcourses"); setShowHam(false) }}>My Courses </span>

        {userData?.role === "student" && <span className='flex items-center justify-center gap-2 text-[18px] text-white border-[2px] border-[#fdfbfb7a] bg-[#000000d5] rounded-lg px-[65px] py-[20px]' onClick={() => { navigate("/wishlist"); setShowHam(false) }}><FaHeart className='w-[20px] h-[20px]' /> Wishlist</span>}
        <span className='flex items-center justify-center gap-2 text-[18px] text-white border-[2px] border-[#fdfbfb7a] bg-[#000000d5] rounded-lg px-[55px] py-[20px]' onClick={() => { navigate("/notifications"); setShowHam(false) }}><IoMdNotifications className='w-[20px] h-[20px]' /> Notifications</span>

        {userData?.role == "educator" ? <div className='flex items-center justify-center gap-2 text-[18px] text-white border-[2px] border-[#fdfbfb7a] bg-[#000000d5] rounded-lg px-[60px] py-[20px]' onClick={() => { navigate("/dashboard"); setShowHam(false) }}>Dashboard</div>
          : ""}
        {userData?.role == "admin" ? <div className='flex items-center justify-center gap-2 text-[18px] text-white border-[2px] border-[#fdfbfb7a] bg-[#000000d5] rounded-lg px-[60px] py-[20px]' onClick={() => { navigate("/admin/dashboard"); setShowHam(false) }}>Admin Panel</div>
          : ""}
        {!userData ? <span className='flex items-center justify-center gap-2 text-[18px] text-white border-[2px] border-[#fdfbfb7a] bg-[#000000d5] rounded-lg px-[80px] py-[20px]' onClick={() => { navigate("/login"); setShowHam(false) }}>Login</span> :
          <span className='flex items-center justify-center gap-2 text-[18px] text-white border-[2px] border-[#fdfbfb7a] bg-[#000000d5] rounded-lg px-[75px] py-[20px]' onClick={() => { handleLogout(); setShowHam(false) }}>LogOut</span>}

      </div>
    </div>

  )
}

export default Nav