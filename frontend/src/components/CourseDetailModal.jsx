import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import { FaCheckCircle, FaStar } from 'react-icons/fa';

const CourseDetailModal = ({ isOpen, onClose, courseData }) => {
  const navigate = useNavigate();

  if (!isOpen || !courseData) return null;

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const avgRating = calculateAverageRating(courseData.reviews);

  // Extract learning points from lectures or use default points
  const learningPoints = courseData.lectures?.slice(0, 5).map(lecture => lecture.lectureTitle) || [
    "Master the fundamentals and advanced concepts",
    "Build real-world projects from scratch",
    "Learn industry best practices and techniques",
    "Get hands-on experience with practical exercises",
    "Gain skills to advance your career"
  ];

  const handleStartSubscription = () => {
    onClose();
    navigate('/login');
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all duration-200"
          aria-label="Close modal"
        >
          <IoClose className="w-6 h-6 text-gray-700" />
        </button>

        {/* Course Image */}
        <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-t-2xl">
          <img
            src={courseData.thumbnail}
            alt={courseData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-800 capitalize">
              {courseData.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Title and Rating */}
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {courseData.title} <span className="text-lg text-gray-600"> By {courseData.educator}</span>
            </h2>
            {courseData.subTitle && (
              <p className="text-gray-600 text-lg">
                {courseData.subTitle}
              </p>
            )}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-yellow-500">
                <FaStar />
                <span className="font-semibold text-gray-800">{avgRating}</span>
              </div>
              <span className="text-gray-500 text-sm">
                ({courseData.reviews?.length || 0} reviews)
              </span>
            </div>
          </div>

          {/* Description */}
          {courseData.description && (
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">About this course</h3>
              <p className="text-gray-700 leading-relaxed">
                {courseData.description}
              </p>
            </div>
          )}

          {/* What You'll Learn */}
          <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-900">What you'll learn ?</h3>
            <p>Get Industry Ready Certification</p>
            <p>Hands-on Projects and Assignments</p>
            <p>Gain Skills To Advance Your Career</p>
            <div className="grid md:grid-cols-2 gap-3">
              {learningPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <FaCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Course Stats */}
          <div className="flex flex-wrap gap-6 text-sm text-gray-600 border-t border-b border-gray-200 py-4">
            <div>
              <span className="font-semibold text-gray-800">
                {courseData.lectures?.length || 0}
              </span>{' '}
              lectures
            </div>
            <div>
              <span className="font-semibold text-gray-800">All levels</span>
            </div>
            <div>
              <span className="font-semibold text-gray-800">Lifetime access</span>
            </div>
          </div>

          {/* Price and CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                ₹{courseData.price}
              </span>
              <span className="text-lg text-gray-400 line-through">₹599</span>
            </div>
            <button
              onClick={handleStartSubscription}
              className="w-full sm:w-auto px-8 py-4 bg-black text-white rounded-xl text-lg font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Subscription
            </button>
          </div>

          {/* Login Prompt */}
          <p className="text-center text-sm text-gray-500">
            Sign in to access full course content and start learning
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailModal;