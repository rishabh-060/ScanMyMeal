const subCategoryModel = require('../models/subCategoryModel')


const addSubcategoryController = async (req, res) => {
    try {
        const { name, image, category } = req.body

        if(!name || !image || !category) {
            return res.status(400).json({
                message : "All fields required",
                error : true,
                success : false
            })
        }

        const payload = {
            image,
            name,
            category
        }

        const createSubCategory = new subCategoryModel(payload)
        const save = await createSubCategory.save()

        if (save) {
            return res.status(200).json({
                message: "Sub category uploaded successfully",
                error: false,
                success: true,
                data: save
            });
        } else {
            return res.status(400).json({
                message: "An error occurred! Please try again",
                error: true,
                success: false
            });
        }
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            success : false,
            error : true
        })
    }
}

const getSubcategoryController = async (req, res) => {
    try {
        const data = await subCategoryModel.find().sort({ createdAt : -1 }).populate('category') || [];

        // Ensure category is an array
        const formattedData = data.map(subCategory => ({
            ...subCategory._doc, 
            category: Array.isArray(subCategory.category) ? subCategory.category : [subCategory.category]
        }));

        return res.status(200).json({
            data: formattedData,
            error: false,
            success: true
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

const editSubCategoryController = async (req, res) => {
    try {
        const { _id, name, image, category } = req.body
        const checkSubCat = await subCategoryModel.findById(_id)

        if(!checkSubCat) {
            return res.status(400).json({
                message : "Something went wrong! Try again",
                success : false,
                error : true
            })
        }

        const UploadSubcategory = await subCategoryModel.findByIdAndUpdate(_id, {
            name,
            image,
            category
        })
        
        return res.status(200).json({
            message : "Update Sub-Category Successfully",
            data : UploadSubcategory,
            success : true,
            error : false
        })
    } catch (error) {
        return res.status(500).json({
            error : true,
            success : false,
            message : error.message || error
        })
    }
}

const deleteSubCategoryController = async (req, res) => {
    try {
        const { _id } = req.body
        const checkSubCat = await subCategoryModel.findByIdAndDelete( _id )

        return res.status(200).json({
            message : "Sub-Category Deleted Successfully",
            success : true,
            error : false,
            data : checkSubCat
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

module.exports = { addSubcategoryController, getSubcategoryController, editSubCategoryController, deleteSubCategoryController }