import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { serverUrl } from '../../App'
import { useNavigate } from 'react-router-dom'

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  // 🔹 ADDED: view state (students by default)
  const [activeView, setActiveView] = useState('students')

  // 🔹 ADDED: navigate for back button
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const safe = axios.create({ baseURL: serverUrl, withCredentials: true })
      try {
        const usersRes = await safe.get('/api/admin/users')
        const coursesRes = await safe.get('/api/course/getpublishedcourses')

        setUsers(usersRes.data || [])
        setCourses(coursesRes.data || [])
      } catch (err) {
        if (err.response?.status === 401) {
          console.warn('Not authorized to access admin data (401)')
        } else {
          console.error('Admin fetch error', err)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const courseMap = new Map()
  if (Array.isArray(courses)) {
    courses.forEach(c => {
      try {
        courseMap.set(String(c._id), c.title)
      } catch {}
    })
  }

  const daysSince = (date) => {
    if (!date) return Infinity
    const diff = Date.now() - new Date(date).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  const isInactive = (user) => {
    if (typeof user.isActive === 'boolean' && user.isActive === false) return true
    const last = user.lastLoginAt || user.updatedAt || user.createdAt
    return daysSince(last) > 60
  }

  const toggleActive = async (userId, current) => {
    const confirmMsg = current
      ? 'Are you sure you want to set this user inactive?'
      : 'Are you sure you want to set this user active?'
    if (!window.confirm(confirmMsg)) return
    try {
      const safe = axios.create({ baseURL: serverUrl, withCredentials: true })
      const res = await safe.put('/api/admin/users/status', { userId, isActive: !current })
      const updated = res.data.user
      setUsers(prev => prev.map(u => (u._id === updated._id ? updated : u)))
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Not authorized. Please login as admin.')
      } else {
        console.error('Failed to update user status', err)
        alert('Failed to update user status')
      }
    }
  }

  if (loading) return <div className="p-6">Loading admin data...</div>
  if (!Array.isArray(users)) {
    return (
      <div className="p-6">
        <pre>{JSON.stringify(users, null, 2)}</pre>
      </div>
    )
  }

  const students = users.filter(u => u.role === 'student')
  const educators = users.filter(u => u.role === 'educator')

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* 🔹 Back Button + Title */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      {/* 🔹 Toggle Buttons */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setActiveView('students')}
          className={`px-4 py-2 rounded ${
            activeView === 'students'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200'
          }`}
        >
          Students
        </button>

        <button
          onClick={() => setActiveView('educators')}
          className={`px-4 py-2 rounded ${
            activeView === 'educators'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200'
          }`}
        >
          Educators
        </button>
      </div>

      {/* ================= STUDENTS ================= */}
      {activeView === 'students' && (
        <section className="mb-8 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-3">Students</h2>

          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Enrolled Courses</th>
                  <th className="border p-2">Last Login</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map(user => {
                  const last = user.lastLoginAt || user.updatedAt || user.createdAt
                  const statusInactive = isInactive(user)
                  return (
                    <tr key={user._id}>
                      <td className="border p-2">{user.name}</td>
                      <td className="border p-2">{user.email}</td>
                      <td className="border p-2">
                        {user.enrolledCourses?.length ? (
                          <ul className="list-disc pl-5">
                            {user.enrolledCourses.map(cid => {
                              const courseObj = typeof cid === 'object' ? cid : null
                              const courseId = courseObj?._id || String(cid)
                              const title =
                                courseObj?.title ||
                                courseMap.get(String(courseId)) ||
                                'Unknown Course'
                              return <li key={courseId}>{title}</li>
                            })}
                          </ul>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="border p-2">
                        {last ? new Date(last).toLocaleDateString() : '—'}
                      </td>
                      <td className="border p-2">
                        <span className={statusInactive ? 'text-red-600' : 'text-green-600'}>
                          {statusInactive ? 'inactive' : 'active'}
                        </span>
                      </td>
                      <td className="border p-2">
                        <button
                          className={`px-3 py-1 rounded ${
                            statusInactive ? 'bg-green-500' : 'bg-red-500'
                          } text-white`}
                          onClick={() => toggleActive(user._id, !statusInactive)}
                        >
                          {statusInactive ? 'Set Active' : 'Set Inactive'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ================= EDUCATORS ================= */}
      {activeView === 'educators' && (
        <section className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-3">Educators</h2>

          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Last Login</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {educators.map(user => {
                  const last = user.lastLoginAt || user.updatedAt || user.createdAt
                  const statusInactive = isInactive(user)
                  return (
                    <tr key={user._id}>
                      <td className="border p-2">{user.name}</td>
                      <td className="border p-2">{user.email}</td>
                      <td className="border p-2">
                        {last ? new Date(last).toLocaleDateString() : '—'}
                      </td>
                      <td className="border p-2">
                        <span className={statusInactive ? 'text-red-600' : 'text-green-600'}>
                          {statusInactive ? 'inactive' : 'active'}
                        </span>
                      </td>
                      <td className="border p-2">
                        <button
                          className={`px-3 py-1 rounded ${
                            statusInactive ? 'bg-green-500' : 'bg-red-500'
                          } text-white`}
                          onClick={() => toggleActive(user._id, !statusInactive)}
                        >
                          {statusInactive ? 'Set Active' : 'Set Inactive'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

export default AdminDashboard
