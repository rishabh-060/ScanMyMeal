const { createSlice } = require('@reduxjs/toolkit');

const initialValue = {
    addressList: [],
}

const addressSlice = createSlice({
    name : 'addresses',
    initialState : initialValue,
    reducers : {
        handleAddAddress : (state, action) => {
            state.addressList = [ ...action.payload ]
        },
    }
})

export const { handleAddAddress } = addressSlice.actions
export default addressSlice.reducer