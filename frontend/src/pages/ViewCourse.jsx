import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { serverUrl } from '../App';
import { FaArrowLeftLong } from "react-icons/fa6";
import img from "../assets/empty.jpg"
import Card from "../components/Card.jsx"
import { setSelectedCourseData } from '../redux/courseSlice';
import { FaLock, FaPlayCircle } from "react-icons/fa";
import { toast } from 'react-toastify';
import { FaStar } from "react-icons/fa6";
import Livechatbox from '../components/Livechatbox';
import ScrollToTop from '../components/ScrollToTop';

function ViewCourse() {

  const { courseId } = useParams();
  const navigate = useNavigate()
  const {courseData} = useSelector(state=>state.course)
  const {userData} = useSelector(state=>state.user)
  const [creatorData , setCreatorData] = useState(null)
  const dispatch = useDispatch()
  const [selectedLecture, setSelectedLecture] = useState(null);
  const {lectureData} = useSelector(state=>state.lecture)
  const {selectedCourseData} = useSelector(state=>state.course)
  const [selectedCreatorCourse,setSelectedCreatorCourse] = useState([])
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // ✅ NEW: Notepad State
  const [notes, setNotes] = useState("");

  // Load saved notes when lecture changes
  useEffect(() => {
    if (selectedLecture) {
      const savedNotes = localStorage.getItem(`notes_${courseId}_${selectedLecture._id}`);
      setNotes(savedNotes || "");
    }
  }, [selectedLecture]);

  const handleNoteChange = (e) => {
    setNotes(e.target.value);
    if (selectedLecture) {
      localStorage.setItem(`notes_${courseId}_${selectedLecture._id}`, e.target.value);
    }
  };

  // ⭐ UPDATED ENROLL FUNCTION
  const handleEnroll = async () => {
    try {
      await axios.post(
        `${serverUrl}/api/course/enroll`,
        { courseId },
        { withCredentials: true }
      );

      toast.success("Successfully Enrolled!");

      // ✅ Update userData in Redux
      const updatedUser = {
        ...userData,
        enrolledCourses: [...userData.enrolledCourses, courseId],
      };
      dispatch({ type: "user/setUserData", payload: updatedUser });

      // ✅ Update local state
      setIsEnrolled(true);

    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const avgRating = calculateAverageRating(selectedCourseData?.reviews);

  const fetchCourseData = async () => {
    courseData.map((item) => {
      if (item._id === courseId) {
        dispatch(setSelectedCourseData(item))
        return null;
      }
    })
  }

  // ✅ UPDATED: checkEnrollment uses Redux state for persistence
  useEffect(() => {
    const enrolled = userData?.enrolledCourses?.some(c => {
      const enrolledId = typeof c === 'string' ? c : c._id;
      return enrolledId?.toString() === courseId?.toString();
    });
    setIsEnrolled(enrolled || false);
  }, [userData, courseId]);

  useEffect(() => {
    fetchCourseData()
  }, [courseId, courseData, lectureData])

  useEffect(() => {
    const getCreator = async () => {
      if (selectedCourseData?.creator) {
        try {
          const result = await axios.post(
            `${serverUrl}/api/course/getcreator`,
            { userId: selectedCourseData.creator },
            { withCredentials: true }
          );
          setCreatorData(result.data);
        } catch (error) {}
      }
    };
    getCreator();
  }, [selectedCourseData]);

  useEffect(() => {
    if (creatorData?._id && courseData.length > 0) {
      const creatorCourses = courseData.filter(
        (course) =>
          course.creator === creatorData._id && course._id !== courseId
      );
      setSelectedCreatorCourse(creatorCourses);
    }
  }, [creatorData, courseData]);

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto bg-white shadow-md rounded-xl p-6 space-y-6 relative">

          <div className="flex flex-col md:flex-row gap-6 ">
            <div className="w-full md:w-1/2">
              {/* ✅ ONLY CHANGE IS HERE */}
              <FaArrowLeftLong
                className='text-[black] w-[22px] h-[22px] cursor-pointer'
                onClick={() => navigate(-1)}
              />

              {selectedCourseData?.thumbnail ? (
                <img
                  src={selectedCourseData?.thumbnail}
                  alt="Course Thumbnail"
                  className="rounded-xl w-full object-cover"
                />
              ) : (
                <img
                  src={img}
                  alt="Course Thumbnail"
                  className="rounded-xl w-full object-cover"
                />
              )}
            </div>

            <div className="flex-1 space-y-2 mt-[20px]">
              <h1 className="text-2xl font-bold">{selectedCourseData?.title}</h1>
              <p className="text-gray-600">{selectedCourseData?.subTitle}</p>

              <div className="flex items-start flex-col justify-between">
                <div className="text-yellow-500 font-medium">
                  ⭐ {avgRating}
                </div>
                <div>
                  <span className="text-lg font-semibold text-black">{selectedCourseData?.price}</span>{" "}
                  <span className="line-through text-sm text-gray-400">₹599</span>
                </div>

                {userData?.role === "student" && (
                  <button
                    onClick={handleEnroll}
                    disabled={isEnrolled}
                    className={`mt-3 px-5 py-2 rounded-lg text-white font-semibold transition ${
                      isEnrolled
                        ? "bg-green-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {isEnrolled ? "Enrolled ✓" : "Enroll Now"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Video + Curriculum */}
          <div className="flex flex-col md:flex-row gap-6">

            <div className="bg-white w-full md:w-2/5 p-6 rounded-2xl shadow-lg border border-gray-200">
              <h2 className="text-xl font-bold mb-1 text-gray-800">Course Curriculum</h2>

              <div className="flex flex-col gap-3">
                {selectedCourseData?.lectures?.map((lecture, index) => (
                  <button
                    key={index}
                    disabled={!lecture.isPreviewFree}
                    onClick={() => lecture.isPreviewFree && setSelectedLecture(lecture)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200 text-left ${
                      lecture.isPreviewFree
                        ? "hover:bg-gray-100 cursor-pointer border-gray-300"
                        : "cursor-not-allowed opacity-60 border-gray-200"
                    } ${
                      selectedLecture?.lectureTitle === lecture.lectureTitle
                        ? "bg-gray-100 border-gray-400"
                        : ""
                    }`}
                  >
                    <span className="text-lg text-gray-700">
                      {lecture.isPreviewFree ? <FaPlayCircle /> : <FaLock />}
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {lecture.lectureTitle}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white w-full md:w-3/5 p-6 rounded-2xl shadow-lg border border-gray-200">

              <div className="aspect-video w-full rounded-lg overflow-hidden mb-4 bg-black flex items-center justify-center">
                {selectedLecture?.videoUrl ? (
                  <video
                    src={selectedLecture.videoUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm">Select a preview lecture</span>
                )}
              </div>

              {selectedLecture && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {selectedLecture?.lectureTitle}
                  </h3>

                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-800 mb-2">📝 Write Notes</h3>
                    <textarea
                      className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:outline-black text-gray-900"
                      placeholder="Write your notes here..."
                      value={notes}
                      onChange={handleNoteChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Notes auto-saved ✅
                    </p>
                  </div>
                </>
              )}

            </div>
          </div>

        </div>
      </div>

      <ScrollToTop />
      {userData?.role === "student" && <Livechatbox isStudent={true} courseId={courseId} />}
    </>
  )
}

export default ViewCourse;
