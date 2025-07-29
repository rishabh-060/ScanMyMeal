const { createSlice } = require('@reduxjs/toolkit');

const initialValue = {
    addressList: [],
    tableId: '',
}

const addressSlice = createSlice({
    name : 'addresses',
    initialState : initialValue,
    reducers : {
        handleAddAddress : (state, action) => {
            state.addressList = [ ...action.payload ]
        },
        setTableId : (state, action) => {
            state.tableId = action.payload
        }
    }
})

export const { handleAddAddress, setTableId } = addressSlice.actions
export default addressSlice.reducer