import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { setUserData, startFetchingUser } from '../redux/userSlice'
import { serverUrl } from '../App'

const useFetchCurrentUser = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchUser = async () => {
      dispatch(startFetchingUser())  // ✅ start fetching
      try {
        const response = await axios.get(serverUrl + '/api/user/currentuser', { withCredentials: true })
        const user = response.data?.user || response.data
        dispatch(setUserData(user))
      } catch (error) {
        dispatch(setUserData(null))
        console.warn('No active session found when fetching current user')
      }
    }

    fetchUser()
  }, [dispatch])
}

export default useFetchCurrentUser

