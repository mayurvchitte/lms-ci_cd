// src/pages/Home.jsx
import React, { useEffect, useRef, useState } from "react";
import Nav from "../components/Nav";
import { SiViaplay } from "react-icons/si";
import Logos from "../components/Logos";
import Cardspage from "../components/Cardspage";
import ExploreCourses from "../components/ExploreCourses";
import About from "../components/About";
import ReviewPage from "../components/ReviewPage";
import Footer from "../components/Footer";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import ai from "../assets/ai.png";
import ai1 from "../assets/ai1.png";
import axios from "axios";
import HeroSection from "../components/HomeSections/HeroSection";
import SkillsSection from "../components/HomeSections/SkillsSection";
import getCouseData from "../customHooks/getCouseData.jsx";
import CourseDetailModal from "../components/CourseDetailModal";
import getCreatorCourseData from "../customHooks/getCreatorCourseData";
// If serverUrl is exported from App.jsx, keep this import; adjust path if needed
import { serverUrl } from "../App";

function Home() {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  //  Fetch course data on Home load
  getCouseData();

  const handleCardClick = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };


  const [creatorCourseData, setCreatorCourseData] = useState([]);
  const [allPublishedCourses, setAllPublishedCourses] = useState([]);
  const scrollRef = useRef(null);
  const location = useLocation();

  // SAFE axios instance which DOES NOT use the global interceptors from ./utils/axiosSetup
  // This prevents a 401 here from triggering the global auth:unauthorized -> redirect
  const safeAxios = axios.create({
    baseURL: serverUrl || "",
    withCredentials: true,
  });

  // Fetch educator courses only when user is an educator AND userData is available
  useEffect(() => {
    let mounted = true;
    const fetchCreatorCourses = async () => {
      if (!userData || userData.role !== "educator") return;

      try {
        const res = await safeAxios.get("/api/course/getcreatorcourses");
        if (!mounted) return;
        setCreatorCourseData(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        // Handle errors locally (no redirect)
        if (err.response?.status === 401) {
          console.warn("Not authorized to fetch creator courses (401).");
        } else {
          console.error("Failed to fetch creator courses:", err);
        }
        // keep creatorCourseData as empty array — UI will show fallback message
      }
    };

    fetchCreatorCourses();
    return () => {
      mounted = false;
    };
  }, [userData]);

  // Fetch all published courses for admin view
  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      if (!userData || userData.role !== 'admin') return;
      try {
        const res = await safeAxios.get('/api/course/getpublishedcourses');
        if (!mounted) return;
        setAllPublishedCourses(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch published courses for admin:', err);
        setAllPublishedCourses([]);
      }
    };
    fetchAll();
    return () => { mounted = false };
  }, [userData]);

  // Auto-scroll for educator courses section (unchanged behavior)
  useEffect(() => {
    if (userData?.role === "educator" && creatorCourseData && creatorCourseData.length > 0) {
      const scrollContainer = scrollRef.current;
      if (!scrollContainer) return;

      const scrollSpeed = 2; // pixels per frame
      const interval = 50; // ms

      const autoScroll = () => {
        if (scrollContainer) {
          scrollContainer.scrollLeft += scrollSpeed;
          if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
            scrollContainer.scrollLeft = 0;
          }
        }
      };

      const scrollInterval = setInterval(autoScroll, interval);
      return () => clearInterval(scrollInterval);
    }
  }, [userData?.role, creatorCourseData]);

  // Smooth scroll on navigation with state.scrollTo
  useEffect(() => {
    if (location?.state?.scrollTo) {
      const id = location.state.scrollTo;
      const element = document.getElementById(id);
      if (element) {
        const offset = 100; // navbar height
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: elementPosition - offset, behavior: "smooth" });
      }
      try {
        window.history.replaceState({}, document.title);
      } catch (e) {
        // ignore
      }
    }
  }, [location]);

  // Admin: show only navbar, ongoing courses list (published), and footer
  if (userData?.role === 'admin') {
    return (
      <div className="w-[100%] overflow-hidden">
        <Nav />
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold mb-4">Ongoing Courses</h2>
          {allPublishedCourses && allPublishedCourses.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPublishedCourses.map(course => (
                <li key={course._id} className="border rounded p-4 bg-white shadow-sm">
                  <div className="flex items-center gap-4">
                    <img src={course.thumbnail || 'https://via.placeholder.com/120x70'} alt={course.title} className="w-28 h-16 object-cover rounded" />
                    <div>
                      <div className="font-semibold text-lg text-blue-600">{course.title}</div>
                      <div className="text-sm text-gray-600">
                        By: {
                          course.creatorName
                            || (course.creator && typeof course.creator === 'object' ? course.creator.name || course.creator.email : course.creator)
                            || 'Unknown'
                        }
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No ongoing courses found.</p>
          )}
        </div>
        <div id="contact-us">
          <Footer />
        </div>
        <CourseDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          courseData={selectedCourse}
        />
      </div>
    )
  }

  return (
    <div className="w-[100%] overflow-hidden">
      <Nav />
      {/* Conditionally render banners and scrolling parts only if not educator */}
      {userData?.role !== 'educator' && (
        <>

      {/* 🟣 Udemy-style sliding hero banners */}
      <div id="explore-courses">
        <HeroSection />
      </div>

      {/* Buttons below banner */}
      <div className="flex flex-col items-center justify-center gap-6 flex-wrap px-4 py-10 bg-gray-50">
        <div className="text-center mb-4">
          <span className="block lg:text-[48px] md:text-[40px] sm:text-[30px] text-[22px] text-black font-bold leading-tight">
            Grow Your Skills to Advance
          </span>
          <span className="block lg:text-[48px] md:text-[40px] sm:text-[30px] text-[22px] text-black font-bold leading-tight mt-2">
            Your Career Path
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            className="px-[32px] py-[16px] bg-white text-black border-2 border-black rounded-[12px] text-[18px] font-semibold flex gap-2 items-center cursor-pointer hover:bg-gray-100 transition-all duration-300 shadow-md"
            onClick={() => navigate("/allcourses")}
          >
            View All Courses <SiViaplay className="w-[22px] h-[22px] fill-black" />
          </button>

          {userData ? (
            <button
              className="px-[32px] py-[16px] bg-black text-white border-2 border-black rounded-[12px] text-[18px] font-semibold flex gap-2 items-center cursor-pointer hover:bg-gray-800 transition-all duration-300 shadow-md"
              onClick={() => navigate("/searchwithai")}
            >
              Search with AI{" "}
              <img src={ai} className="w-[24px] h-[24px] rounded-full hidden lg:block" alt="" />
              <img src={ai1} className="w-[26px] h-[26px] rounded-full lg:hidden" alt="" />
            </button>
          ) : (
            <button
              className="px-[32px] py-[16px] bg-black text-white border-2 border-black rounded-[12px] text-[18px] font-semibold flex gap-2 items-center cursor-pointer hover:bg-gray-800 transition-all duration-300 shadow-md"
              onClick={() => navigate("/login")}
            >
              Search with AI{" "}
              <img src={ai} className="w-[24px] h-[24px] rounded-full hidden lg:block" alt="" />
              <img src={ai1} className="w-[26px] h-[26px] rounded-full lg:hidden" alt="" />
            </button>
          )}
        </div>
      </div>

      {/* 🟣 Udemy-style course slider */}
      <SkillsSection />
      

      {/* LMS sections below */}
      <Logos />
      <ExploreCourses />
      <Cardspage onCardClick={handleCardClick} />
      <div id="about-us">
        <About />
      </div>
      <ReviewPage />
      </>
        )}

      {/* Educator-only sections — displayed only if user is educator */}
      {userData?.role === "educator" && (
        <>
          <div id="students" className="flex flex-col items-center justify-center gap-6 px-4 py-10 bg-gray-50 mt-20">
            <div className="text-center mb-4">
              <span className="block lg:text-[48px] md:text-[40px] sm:text-[30px] text-[22px] text-blue-600  font-bold leading-tight">
                Your Students
              </span>
            </div>

            <div className="w-full max-w-4xl">
              {creatorCourseData && creatorCourseData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {creatorCourseData.map((course) => (
                    <div key={course._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                      <h3 className="text-xl font-semibold text-blue-600 mb-2">{course.title}</h3>
                      <p className="text-gray-600">Enrolled Students: {course.enrolledStudents ? course.enrolledStudents.length : 0}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No classrooms created yet.</p>
              )}
            </div>
          </div>

          <div id="your-courses" className="flex flex-col items-center justify-center gap-6 px-4 py-10 bg-gray-50 mt-20">
            <div className="flex items-center justify-between w-full max-w-6xl mx-auto mb-4">
              <div>
                <span className="block lg:text-[48px] md:text-[40px] sm:text-[30px] text-[22px] text-blue-600 font-bold leading-tight">
                  Your Courses
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 text-white rounded-lg shadow-lg hover:scale-105 transform transition-all duration-200 flex items-center gap-2"
                  onClick={() => navigate("/courses")}
                  aria-label="View all courses"
                >
                  <SiViaplay className="w-5 h-5" />
                  <span className="font-semibold">View All Courses</span>
                </button>
              </div>
            </div>

            <div className="w-full max-w-6xl">
              {creatorCourseData && creatorCourseData.length > 0 ? (
                <div ref={scrollRef} className="flex overflow-x-hidden gap-6 pb-4">
                  {creatorCourseData.map((course) => (
                    <div key={course._id} className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                      <img src={course.thumbnail || "https://via.placeholder.com/256x128/cccccc/000000?text=No+Image"} alt={course.title} className="w-full h-32 object-cover rounded-t-lg" />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-blue-600 mb-2">{course.title}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-6 pb-4">
                  <div className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                    <img src="https://via.placeholder.com/256x128/007396/FFFFFF?text=Java" alt="Java Course" className="w-full h-32 object-cover rounded-t-lg" />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-blue-600 mb-2">Java Programming</h3>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div id="contact-us">
        <Footer />
      </div>
      {/* Course Detail Modal */}
      <CourseDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        courseData={selectedCourse}
      />
    </div>
  );
}

export default Home;