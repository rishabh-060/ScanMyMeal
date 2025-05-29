import { createSlice } from '@reduxjs/toolkit';

const initialValue = {
    id : "",
    name : "",
    email : "",
    avatar : "",
    mobile : "",
    verify_email : "",
    last_login_date : "",
    status : "",
    address_details : [],
    shopping_cart : [],
    order_history : [],
    role : "",
    createdAt : "",
    updatedAt : ""
}

const userSlice = createSlice({
    name : 'user',
    initialState :initialValue,
    reducers : {
        setUserDetails : (state, action) => {
            state.id = action.payload?._id
            state.name = action.payload?.name
            state.email = action.payload?.email
            state.avatar = action.payload?.avatar || null
            state.mobile = action.payload?.mobile
            state.verify_email = action.payload?.verify_email || false
            state.last_login_date = action.payload?.last_login_date
            state.status = action.payload?.status
            state.address_details = action.payload?.address_details
            state.shopping_cart = action.payload?.shopping_cart
            state.order_history = action.payload?.order_history
            state.role = action.payload?.role
            state.createdAt = action.payload?.createdAt
            state.updatedAt = action.payload?.updatedAt
        },
        updateAvatar : (state, action) => {
            state.avatar = action.payload
        },
        logout : (state, action) => {
            state.id = ""
            state.name = ""
            state.email = ""
            state.avatar = ""
            state.mobile = ""
            state.verify_email = ""
            state.last_login_date = ""
            state.status = ""
            state.address_details = []
            state.shopping_cart = []
            state.order_history = []
            state.role = ""
            state.createdAt = ""
            state.updatedAt = ""
        }
    }
})

export const { setUserDetails, logout, updateAvatar } = userSlice.actions
export default userSlice.reducer