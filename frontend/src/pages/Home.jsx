import React from "react";
import Nav from "../components/Nav";
import { SiViaplay } from "react-icons/si";
import Logos from "../components/Logos";
import Cardspage from "../components/Cardspage";
import ExploreCourses from "../components/ExploreCourses";
import About from "../components/About";
import ReviewPage from "../components/ReviewPage";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ai from "../assets/ai.png";
import ai1 from "../assets/ai1.png";
import getCouseData from "../customHooks/getCouseData.jsx";

// Udemy-style sections
import HeroSection from "../components/HomeSections/HeroSection";
import SkillsSection from "../components/HomeSections/SkillsSection";

function Home() {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  //  Fetch course data on Home load
  getCouseData();

  return (
    <div className="w-[100%] overflow-hidden">
      <Nav />

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
              <img
                src={ai}
                className="w-[24px] h-[24px] rounded-full hidden lg:block"
                alt=""
              />
              <img
                src={ai1}
                className="w-[26px] h-[26px] rounded-full lg:hidden"
                alt=""
              />
            </button>
          ) : (
            <button
              className="px-[32px] py-[16px] bg-black text-white border-2 border-black rounded-[12px] text-[18px] font-semibold flex gap-2 items-center cursor-pointer hover:bg-gray-800 transition-all duration-300 shadow-md"
              onClick={() => navigate("/login")}
            >
              Search with AI{" "}
              <img
                src={ai}
                className="w-[24px] h-[24px] rounded-full hidden lg:block"
                alt=""
              />
              <img
                src={ai1}
                className="w-[26px] h-[26px] rounded-full lg:hidden"
                alt=""
              />
            </button>
          )}
        </div>
      </div>

      {/* 🟣 Udemy-style course slider */}
      <SkillsSection />

      {/* LMS sections below */}
      <Logos />
      <ExploreCourses />
      <Cardspage />
      <div id="about-us">
        <About />
      </div>
      <ReviewPage />
      <div id="contact-us">
        <Footer />
      </div>
    </div>
  );
}

export default Home;

