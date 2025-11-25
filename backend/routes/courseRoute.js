import express from "express";
import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";

import {
  createCourse,
  editCourse,
  removeCourse,
  getPublishedCourses,
  getCreatorCourses,
  getCourseById,
  createLecture,
  editLecture,
  removeLecture,
  getCourseLecture,
  getCreatorById,
  checkEnrollment,
  enrollCourse
} from "../controllers/courseController.js";

const courseRouter = express.Router();

// ✅ Create Course
courseRouter.post("/create", isAuth, createCourse);

// ✅ Get Published Courses (student side)
courseRouter.get("/getpublishedcourses", getPublishedCourses);

// ✅ Get all courses of educator
courseRouter.get("/getcreatorcourses", isAuth, getCreatorCourses);

// ✅ Edit course data + thumbnail upload
courseRouter.post(
  "/editcourse/:courseId",
  isAuth,
  upload.single("thumbnail"),
  editCourse
);

// ✅ Get single course details
courseRouter.get("/getcourse/:courseId", isAuth, getCourseById);

// ✅ Remove course
courseRouter.delete("/removecourse/:courseId", isAuth, removeCourse);

// ✅ Create lecture under a course
courseRouter.post("/createlecture/:courseId", isAuth, createLecture);

// ✅ Get all lectures of a course
courseRouter.get("/getcourselecture/:courseId", isAuth, getCourseLecture);

// ✅ Edit lecture + video upload
courseRouter.post(
  "/editlecture/:lectureId",
  isAuth,
  upload.single("videoUrl"),
  editLecture
);

// ✅ Remove lecture
courseRouter.delete("/removelecture/:lectureId", isAuth, removeLecture);

// ✅ Get educator info for a course
courseRouter.post("/getcreator", isAuth, getCreatorById);

// ✅ Check if student is enrolled in course
courseRouter.get("/enrolled/:courseId", isAuth, checkEnrollment);

// ✅ Enroll in a course
courseRouter.post("/enroll", isAuth, enrollCourse);
export default courseRouter;