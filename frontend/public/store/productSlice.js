import SubCategory from '@/app/admin/sub-category/page'
import { createSlice } from '@reduxjs/toolkit'


const initialValue = {
    allCategory : [],
    loadingCategory : false,
    allSubCategory : [],
    products : []
}


const productSlice = createSlice ({
    name : 'product',
    initialState : initialValue,
    reducers : {
        setAllCategory : (state, action) => {
            state.allCategory = [...action.payload]
        },
        setLoadingCategory : (state, action) => {
            state.loadingCategory = action.payload
        },
        setAllSubCategory : (state, action) => {
            state.allSubCategory = [...action.payload]
        },
        setProduct : (state, action) => {
            state.products = [...action.payload]
        }
    }
})

export const { setAllCategory, setAllSubCategory, setLoadingCategory, setProduct } = productSlice.actions
export default productSlice.reducer