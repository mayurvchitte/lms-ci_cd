import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { serverUrl } from '../../App'

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const safe = axios.create({ baseURL: serverUrl, withCredentials: true })
      try {
        // Fetch all users (admin-only endpoint) using a safe instance without global interceptors
        const usersRes = await safe.get('/api/admin/users')
        // Fetch published courses to map ids -> titles
        const coursesRes = await safe.get('/api/course/getpublishedcourses')

        setUsers(usersRes.data || [])
        setCourses(coursesRes.data || [])
      } catch (err) {
        // Handle 401 locally to avoid global redirect
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

  // Build a simple map from course id -> title (avoid useMemo runtime issues)
  const courseMap = new Map()
  if (Array.isArray(courses)) {
    courses.forEach(c => {
      try {
        courseMap.set(String(c._id), c.title)
      } catch (e) {
        // ignore malformed course entries
      }
    })
  }

  const daysSince = (date) => {
    if (!date) return Infinity
    const diff = Date.now() - new Date(date).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  const isInactive = (user) => {
    // If user has explicit isActive flag set to false, treat inactive
    if (typeof user.isActive === 'boolean' && user.isActive === false) return true
    // Otherwise determine by lastLoginAt or updatedAt/createdAt
    const last = user.lastLoginAt || user.updatedAt || user.createdAt
    return daysSince(last) > 60
  }

  const toggleActive = async (userId, current) => {
    const confirmMsg = current ? 'Are you sure you want to set this user inactive?' : 'Are you sure you want to set this user active?'
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
  // Defensive: if users is not an array, show debug info instead of crashing
  if (!Array.isArray(users)) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2">Admin data shape (unexpected)</h2>
        <pre className="whitespace-pre-wrap max-h-96 overflow-auto bg-white p-4 border rounded">{JSON.stringify(users, null, 2)}</pre>
        <p className="mt-4 text-red-600">`users` is not an array — check server response.</p>
      </div>
    )
  }

  const students = users.filter(u => u.role === 'student')
  const educators = users.filter(u => u.role === 'educator')

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <section className="mb-8 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-3">Students</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Email</th>
                <th className="border p-2 text-left">Enrolled Courses</th>
                <th className="border p-2 text-left">Last Login</th>
                <th className="border p-2 text-left">Status</th>
                <th className="border p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map(user => {
                const last = user.lastLoginAt || user.updatedAt || user.createdAt
                const statusInactive = isInactive(user)
                return (
                  <tr key={user._id} className="odd:bg-white even:bg-gray-50">
                    <td className="border p-2">{user.name}</td>
                    <td className="border p-2">{user.email}</td>
                    <td className="border p-2">
                      {user.enrolledCourses && user.enrolledCourses.length > 0 ? (
                        <ul className="list-disc pl-5">
                          {user.enrolledCourses.map((cid) => {
                            // cid can be an ObjectId string or a populated course object
                            const courseObj = cid && typeof cid === 'object' ? cid : null
                            const courseId = courseObj?._id || String(cid)
                            const title = courseObj?.title || courseMap.get(String(courseId)) || 'Unknown Course'
                            return (
                              <li key={String(courseId)}>{title}</li>
                            )
                          })}
                        </ul>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="border p-2">{last ? new Date(last).toLocaleDateString() : '—'}</td>
                    <td className="border p-2">
                      <span className={statusInactive ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                        {statusInactive ? 'inactive' : 'active'}
                      </span>
                    </td>
                    <td className="border p-2">
                      <button
                        className={"px-3 py-1 rounded " + (statusInactive ? 'bg-green-500 text-white' : 'bg-red-500 text-white')}
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

      <section className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-3">Educators</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Email</th>
                <th className="border p-2 text-left">Last Login</th>
                <th className="border p-2 text-left">Status</th>
                <th className="border p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {educators.map(user => {
                const last = user.lastLoginAt || user.updatedAt || user.createdAt
                const statusInactive = isInactive(user)
                return (
                  <tr key={user._id} className="odd:bg-white even:bg-gray-50">
                    <td className="border p-2">{user.name}</td>
                    <td className="border p-2">{user.email}</td>
                    <td className="border p-2">{last ? new Date(last).toLocaleDateString() : '—'}</td>
                    <td className="border p-2">
                      <span className={statusInactive ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                        {statusInactive ? 'inactive' : 'active'}
                      </span>
                    </td>
                    <td className="border p-2">
                      <button
                        className={"px-3 py-1 rounded " + (statusInactive ? 'bg-green-500 text-white' : 'bg-red-500 text-white')}
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
    </div>
  )
}

export default AdminDashboard

