const categoryModel = require('../models/categoryModel')
const subCategoryModel = require('../models/subCategoryModel')
const productModel = require('../models/productModel')


// Add new category controller
const addCategoryController = async (req, res) => {
    try {
        const { name, image } = req.body

        if(!name || !image) {
            return res.status(400).json({
                message : 'All feilds Required',
                error : true,
                success : false
            })
        }

        const addCategory = new categoryModel({
            name,
            image
        })

        const saveCategory = await addCategory.save()

        if(!saveCategory){
            return res.status(500).json({
                message : 'Something went wrong! Try again',
                error : true,
                success : false
            })
        }

        return res.status(200).json({
            message : 'Category Added Successfully',
            data : saveCategory,
            error : false,
            success : true
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// get all category controller
const getCategoryController = async (req, res) => {
    try {
        const data = await categoryModel.find().sort({ createdAt : -1 }) || []

        return res.status(200).json({
            data : data,
            error : false,
            success : true
        })
        
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            success : false,
            error : true
        })
    }
}

// update category controller
const updateCategoryController = async (req, res) => {
    try {
        const { _id, name, image } = req.body
        
        const updateCategory = await categoryModel.updateOne({
            _id : _id
        }, {
            name,
            image
        })

        return res.status(200).json({
            message : "Updated Successfully",
            success : true,
            error : false,
            data : updateCategory
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            success : false,
            error : true
        })
    }
}

// Delete category controller
const deleteCategoryController = async (req, res) => {
    try {
        const { _id } = req.body

        const checkSubCategory = await subCategoryModel.find({
            category : {
                "$in" : [ _id ]
            }
        }).countDocuments()
        const checkProducts = await productModel.find({
            category : {
                "$in" : [ _id ]
            }
        }).countDocuments()

        if(checkSubCategory > 0 || checkProducts > 0){
            return res.status(500).json({
                message : "Category is already in use",
                success : false,
                error : true
            })
        }

        const deleteCategory = await categoryModel.deleteOne({ _id : _id})

        return res.status(200).json({
            message : "Category Deleted Successfully",
            error : false,
            success : true,
            data : deleteCategory
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            success : false,
            error : true
        })
    }
}

module.exports = { addCategoryController, getCategoryController, updateCategoryController, deleteCategoryController }