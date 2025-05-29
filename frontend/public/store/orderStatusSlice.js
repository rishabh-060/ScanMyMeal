import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  status: '',
}

const orderStatusSlice = createSlice({
  name: 'orderStatus',
  initialState,
  reducers: {
    setOrderStatus: (state, action) => {
      state.status = action.payload
    },
    clearOrderStatus: (state) => {
      state.status = ''
    },
  },
})

export const { setOrderStatus, clearOrderStatus } = orderStatusSlice.actions
export default orderStatusSlice.reducer
