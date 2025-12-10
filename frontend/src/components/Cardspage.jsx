import React, { useEffect, useState } from 'react'
import Card from "./Card.jsx"
import CourseDetailModal from "./CourseDetailModal.jsx"
import { useSelector } from 'react-redux';
import { SiViaplay } from "react-icons/si";
import { useNavigate } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function Cardspage() {
  const [popularCourses,setPopularCourses] =useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {courseData} = useSelector(state=>state.course)
  const navigate = useNavigate()

  const CustomNextArrow = ({ onClick }) => (
    <button
      className="slick-arrow slick-next"
      onClick={onClick}
      style={{
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'grey',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 1,
        fontSize: '20px'
      }}
    >
      →
    </button>
  );

  const CustomPrevArrow = ({ onClick }) => (
    <button
      className="slick-arrow slick-prev"
      onClick={onClick}
      style={{
        position: 'absolute',
        left: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'grey',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 1,
        fontSize: '20px'
      }}
    >
      ←
    </button>
  );

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  useEffect(()=>{
    setPopularCourses(courseData.slice(0,6));
  },[courseData])

  const handleCardClick = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  }

  return (
    <div className=' relative flex items-center justify-center flex-col'>
      <h1 className='md:text-[45px] text-[30px] font-semibold text-center mt-[30px] px-[20px]'>Our Popular Courses</h1>
      <span className='lg:w-[50%] md:w-[80%] text-[15px] text-center mt-[30px] mb-[30px] px-[20px]'>Explore top-rated courses designed to boost your skills, enhance careers, and unlock opportunities in tech, AI, business, and beyond.</span>
      <div className='w-[100%] flex items-center justify-center lg:p-[50px] md:p-[30px] p-[10px] mb-[40px]'>
        <Slider {...settings} className='w-full'>
          {
            popularCourses.map((item,index)=>(
              <div key={index} className='px-2'>
                <Card
                  id={item._id}
                  thumbnail={item.thumbnail}
                  title={item.title}
                  price={item.price}
                  category={item.category}
                  reviews={item.reviews}
                  courseData={item}
                  onCardClick={handleCardClick}
                />
              </div>
            ))
          }
        </Slider>
      </div>
      <button className=' absolute right-[5%] md:right-[9%] bottom-4 px-[24px] py-[14px] border-2 lg:border-white border-black bg-black lg:text-white text-black rounded-[10px] text-[20px] font-light flex gap-2 cursor-pointer' onClick={()=>navigate("/allcourses")}>View all Courses <SiViaplay className='w-[40px] h-[40px] lg:fill-white fill-black' /></button>
      
      {/* Course Detail Modal */}
      <CourseDetailModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        courseData={selectedCourse}
      />
    </div>
  )
}

export default Cardspage