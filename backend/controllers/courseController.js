import { uploadFileToS3, deleteFileFromS3 } from "../configs/awsS3.js";
import { v4 as uuidv4 } from "uuid";
import Course from "../models/courseModel.js";
import Lecture from "../models/lectureModel.js";
import User from "../models/userModel.js";

// ✅ CREATE COURSE
export const createCourse = async (req, res) => {
  try {
    const { title, category } = req.body;

    if (!title || !category) {
      return res.status(400).json({ message: "Title & category required" });
    }

    const course = await Course.create({
      title,
      category,
      creator: req.userId,
    });

    return res.status(201).json(course);
  } catch (error) {
    return res.status(500).json({ message: `Failed to create course ${error}` });
  }
};

// ✅ GET PUBLISHED COURSES  (UPDATED)
export const getPublishedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).populate(
      "lectures reviews creator"
    );

    // Add educator name to each course
    const coursesWithEducator = courses.map(course => ({
      ...course.toObject(),
      educator: course.creator ? course.creator.name : "Unknown Educator"
    }));

    return res.status(200).json(coursesWithEducator);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to get published courses ${error}` });
  }
};

// ✅ GET COURSES CREATED BY EDUCATOR
export const getCreatorCourses = async (req, res) => {
  try {
    const userId = req.userId;

    const courses = await Course.find({ creator: userId });

    return res.status(200).json(courses);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to get creator courses ${error}` });
  }
};

// ✅ EDIT COURSE
export const editCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      title,
      subTitle,
      description,
      category,
      level,
      price,
      isPublished,
    } = req.body;

    let course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    let thumbnail;

    if (req.file) {
      if (course.thumbnail) {
        const oldKey = course.thumbnail.split("/").pop();
        await deleteFileFromS3(oldKey);
      }

      const key = `thumbnails/${uuidv4()}-${req.file.originalname}`;
      thumbnail = await uploadFileToS3(req.file.path, key);
    }

    const updateData = {
      title,
      subTitle,
      description,
      category,
      level,
      price,
      isPublished,
      thumbnail,
    };

    course = await Course.findByIdAndUpdate(courseId, updateData, { new: true });

    return res.status(200).json(course);
  } catch (error) {
    return res.status(500).json({ message: `Failed to update course ${error}` });
  }
};

// ✅ GET COURSE BY ID (UPDATED)
export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate("lectures reviews creator");

    if (!course) return res.status(404).json({ message: "Course not found" });

    // Add educator name to the course
    const courseWithEducator = {
      ...course.toObject(),
      educator: course.creator ? course.creator.name : "Unknown Educator"
    };

    return res.status(200).json(courseWithEducator);
  } catch (error) {
    return res.status(500).json({ message: `Failed to get course ${error}` });
  }
};

// ✅ REMOVE COURSE
export const removeCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    await course.deleteOne();
    return res.status(200).json({ message: "Course removed successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Failed to remove course ${error}` });
  }
};

// ✅ CREATE LECTURE
export const createLecture = async (req, res) => {
  try {
    const { lectureTitle } = req.body;
    const { courseId } = req.params;

    if (!lectureTitle) {
      return res.status(400).json({ message: "Lecture title required" });
    }

    const lecture = await Lecture.create({ lectureTitle });

    const course = await Course.findById(courseId);
    if (course) {
      course.lectures.push(lecture._id);
      await course.populate("lectures");
      await course.save();
    }

    return res.status(201).json({ lecture, course });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to create lecture ${error}` });
  }
};

// ✅ GET ALL LECTURES OF A COURSE
export const getCourseLecture = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate("lectures");
    if (!course) return res.status(404).json({ message: "Course not found" });

    return res.status(200).json(course);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to get lectures ${error}` });
  }
};

// ✅ EDIT LECTURE + VIDEO UPLOAD
export const editLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { lectureTitle, isPreviewFree } = req.body;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    if (req.file) {
      if (lecture.videoUrl) {
        const oldKey = lecture.videoUrl.split("/").pop();
        await deleteFileFromS3(oldKey);
      }

      const key = `lectures/${uuidv4()}-${req.file.originalname}`;
      const videoUrl = await uploadFileToS3(req.file.path, key);
      lecture.videoUrl = videoUrl;
    }

    if (lectureTitle) lecture.lectureTitle = lectureTitle;
    lecture.isPreviewFree = isPreviewFree;

    const savedLecture = await lecture.save();
    return res.status(200).json(savedLecture);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to edit lecture ${error}` });
  }
};

// ✅ REMOVE LECTURE
export const removeLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const lecture = await Lecture.findByIdAndDelete(lectureId);
    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    await Course.updateOne(
      { lectures: lectureId },
      { $pull: { lectures: lectureId } }
    );

    return res.status(200).json({ message: "Lecture removed successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to remove lecture ${error}` });
  }
};

// ✅ GET CREATOR INFO
export const getCreatorById = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Get creator error" });
  }
};

// ✅ CHECK IF STUDENT IS ENROLLED
export const checkEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;

    const course = await Course.findOne({
      _id: courseId,
      enrolledStudents: userId,
    });

    if (course) return res.status(200).json({ enrolled: true });

    return res.status(200).json({ enrolled: false });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to check enrollment ${error}` });
  }
};