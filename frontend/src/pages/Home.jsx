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

// IMPORT YOUR CATEGORY IMAGE (same for all categories)
import categoryImage from "../assets/category.jpg";

import { serverUrl } from "../App";

function Home() {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  const [allPublishedCourses, setAllPublishedCourses] = useState([]); // ⭐ ADDED FOR ADMIN

  const scrollRef = useRef(null);
  const location = useLocation();

  const safeAxios = axios.create({
    baseURL: serverUrl || "",
    withCredentials: true,
  });

  /* ---------------- EDUCATOR COURSE FETCH ---------------- */
  useEffect(() => {
    let mounted = true;

    const fetchCreatorCourses = async () => {
      if (!userData || userData.role !== "educator") return;

      try {
        const res = await safeAxios.get("/api/course/getcreatorcourses");
        if (!mounted) return;
        setCreatorCourseData(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (err.response?.status === 401) {
          console.warn("Not authorized to fetch creator courses (401).");
        } else {
          console.error("Failed to fetch creator courses:", err);
        }
      }
    };

    fetchCreatorCourses();
    return () => {
      mounted = false;
    };
  }, [userData]);

  /* ---------------- ⭐ ADMIN: FETCH ALL PUBLISHED COURSES ---------------- */
  useEffect(() => {
    let mounted = true;

    const fetchAllPublished = async () => {
      if (!userData || userData.role !== "admin") return;

      try {
        const res = await safeAxios.get("/api/course/getpublishedcourses");
        if (!mounted) return;
        setAllPublishedCourses(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch published courses for admin:", err);
        setAllPublishedCourses([]);
      }
    };

    fetchAllPublished();
    return () => {
      mounted = false;
    };
  }, [userData]);

  /* ---------------- SCROLL LOGIC ---------------- */
  useEffect(() => {
    if (location?.state?.scrollTo) {
      const id = location.state.scrollTo;
      const element = document.getElementById(id);
      if (element) {
        const offset = 100;
        const elementPosition =
          element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: elementPosition - offset, behavior: "smooth" });
      }
      try {
        window.history.replaceState({}, document.title);
      } catch {}
    }
  }, [location]);


  /* ---------------- ⭐ ADMIN VIEW OVERRIDE ---------------- */
  if (userData?.role === "admin") {
  return (
    <div className="w-[100%] overflow-hidden">
      <Nav />

      {/* spacing ONLY for admin */}
      <div className="max-w-6xl mx-auto px-4 py-10 mt-20">
        <h2 className="text-2xl font-bold mb-4">Ongoing Courses</h2>

          {allPublishedCourses.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPublishedCourses.map((course) => (
                <li key={course._id} className="border rounded p-4 bg-white shadow-sm">
                  <div className="flex items-center gap-4">
                    <img
                      src={course.thumbnail || "https://via.placeholder.com/120x70"}
                      alt={course.title}
                      className="w-28 h-16 object-cover rounded"
                    />
                    <div>
                      <div className="font-semibold text-lg text-blue-600">
                        {course.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        By:{" "}
                        {course.creatorName ||
                          (course.creator && typeof course.creator === "object"
                            ? course.creator.name || course.creator.email
                            : course.creator) ||
                          "Unknown"}
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

        <Footer />

        <CourseDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          courseData={selectedCourse}
        />
      </div>
    );
  }

  /* ---------------- NORMAL USER + EDUCATOR VIEW (UNCHANGED) ---------------- */
  return (
    <div className="w-[100%] overflow-hidden">
      <Nav />

      {/* USER VIEW (NOT EDUCATOR) */}
      {userData?.role !== "educator" && (
        <>
          <div id="explore-courses">
            <HeroSection />
          </div>

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

          <SkillsSection />
          <Logos />
          <ExploreCourses />
          <Cardspage onCardClick={handleCardClick} />
          <div id="about-us">
            <About />
          </div>
          <ReviewPage />
        </>
      )}

      {/* EDUCATOR VIEW (UNCHANGED) */}
      {userData?.role === "educator" && (
        <>
          {/* STUDENTS SECTION */}
          <div
            id="students"
            className="flex flex-col items-center justify-center gap-6 px-4 py-10 bg-gray-50 mt-20"
          >
            <div className="text-center mb-4">
              <span className="block lg:text-[48px] md:text-[40px] sm:text-[30px] text-[22px] text-blue-600 font-bold leading-tight">
                Your Students
              </span>
            </div>

            <div className="w-full max-w-4xl">
              {creatorCourseData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {creatorCourseData.map((course) => (
                    <div
                      key={course._id}
                      className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                    >
                      <h3 className="text-xl font-semibold text-blue-600 mb-2">{course.title}</h3>
                      <p className="text-gray-600">
                        Enrolled Students:{" "}
                        {course.enrolledStudents ? course.enrolledStudents.length : 0}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No classrooms created yet.</p>
              )}
            </div>
          </div>

          <div
            id="your-courses"
            className="flex flex-col items-center justify-center gap-6 px-4 py-10 bg-gray-50 mt-20"
          >
            <div className="flex items-center justify-between w-full max-w-6xl mx-auto mb-4">
              <span className="block lg:text-[48px] md:text-[40px] sm:text-[30px] text-[22px] text-blue-600 font-bold leading-tight">
                YourCourses
              </span>

              <button
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 text-white rounded-lg shadow-lg hover:scale-105 transform transition-all duration-200 flex items-center gap-2"
                onClick={() => navigate("/courses")}
              >
                <SiViaplay className="w-5 h-5" />
                <span className="font-semibold">View All Courses</span>
              </button>
            </div>

            <div className="relative w-full max-w-6xl">
              <button
                onClick={() =>
                  scrollRef.current.scrollBy({ left: -300, behavior: "smooth" })
                }
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg z-10 hover:bg-gray-100"
              >
                ←
              </button>

              <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-6 py-2 scroll-smooth"
              >
                {Object.keys(
                  creatorCourseData.reduce((acc, course) => {
                    if (!course.category) return acc;
                    if (!acc[course.category]) acc[course.category] = [];
                    acc[course.category].push(course);
                    return acc;
                  }, {})
                ).map((category) => {
                  const courses = creatorCourseData.filter(
                    (c) => c.category === category
                  );
                  return (
                    <div
                      key={category}
                      className="min-w-[300px] bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-2xl transition overflow-hidden flex-shrink-0"
                    >
                      <img
                        src={categoryImage}
                        alt="Category"
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-5">
                        <h2 className="text-2xl font-bold text-blue-600 mb-3">
                          {category}
                        </h2>
                        <div className="flex flex-col gap-2">
                          {courses.slice(0, 3).map((course) => (
                            <span
                              key={course._id}
                              onClick={() =>
                                navigate(`/createlecture/${course._id}`)
                              }
                              className="text-blue-600 underline cursor-pointer hover:text-blue-800"
                            >
                              {course.title}
                            </span>
                          ))}
                          {courses.length > 3 && (
                            <span
                              className="text-gray-500 cursor-pointer"
                              onClick={() => navigate(`/category/${category}`)}
                            >
                              +{courses.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  scrollRef.current.scrollBy({ left: 300, behavior: "smooth" })
                }
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg z-10 hover:bg-gray-100"
              >
                →
              </button>
            </div>
          </div>
        </>
      )}

      <div id="contact-us">
        <Footer />
      </div>

      <CourseDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        courseData={selectedCourse}
      />
    </div>
  );
}

export default Home;
