import { createSlice } from "@reduxjs/toolkit"

const userSlice=createSlice({
    name:"user",
    initialState:{
        userData:null,
        wishlist: [],
        notifications: []
    },//setUserData("ankush")<={payload}
    reducers:{
        setUserData:(state,action)=>{
        state.userData=action.payload
        },
        setWishlist: (state, action) => {
            state.wishlist = action.payload;
        },
        addToWishlist: (state, action) => {
            if (!state.wishlist.includes(action.payload)) {
                state.wishlist.push(action.payload);
            }
        },
        removeFromWishlist: (state, action) => {
            state.wishlist = state.wishlist.filter(id => id !== action.payload);
        },
        setNotifications: (state, action) => {
            state.notifications = action.payload;
        },
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
        },
        markNotificationAsRead: (state, action) => {
            const notification = state.notifications.find(n => n._id === action.payload);
            if (notification) {
                notification.read = true;
            }
        }
    }
})

export const {setUserData, setWishlist, addToWishlist, removeFromWishlist, setNotifications, addNotification, markNotificationAsRead}=userSlice.actions
export default userSlice.reducer
