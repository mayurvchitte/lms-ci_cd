import React, { useState, useEffect } from 'react';
import VideoUpload from '../../components/VideoUpload';
import axios from '../../utils/axiosSetup'; // Assuming you have this for API calls

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');

  // In a real application, you would fetch the courses from your API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // This is a placeholder. You should have an endpoint to get courses created by the educator.
        const { data } = await axios.get('/api/courses/my-courses'); // Example endpoint
        setCourses(data.courses);
        if (data.courses.length > 0) {
          setSelectedCourse(data.courses[0]._id); // Select the first course by default
        }
      } catch (error) {
        console.error("Failed to fetch courses", error);
        // Mock data for demonstration if the API call fails
        setCourses([{ _id: 'mock-course-1', title: 'Mock Course 1' }, { _id: 'mock-course-2', title: 'Mock Course 2' }]);
        setSelectedCourse('mock-course-1');
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="admin-dashboard p-6">
      <h1>Admin Dashboard</h1>
      <p>Welcome to the Admin Panel. This is the overview page.</p>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Upload a Video to a Course</h2>
        <div className="mb-4">
          <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-2">Select a Course:</label>
          <select
            id="course-select"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-black focus:outline-none"
          >
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
        {selectedCourse ? (
          <VideoUpload courseId={selectedCourse} />
        ) : (
          <p>Please select a course to upload a video.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

