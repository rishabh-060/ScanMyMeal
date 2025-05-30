const productModel = require('../models/productModel')

const createProductController = async (req, res) => {
    try {
        const { name, description, image, category, SubCategory, unit, stock, price, discount, more_details } = req.body

        if( !name || !description || !image[0] || !category[0] || !SubCategory[0] || !unit || !stock || !price || !discount ) {
            return res.status(400).json({
                success : false,
                error : true,
                message : "All Fields Required"
            })
        }

        let subCategory = SubCategory

        const product = new productModel({
            name, description, image, category, subCategory, unit, stock, price, discount, more_details
        })

        console.log(description)

        const saveProduct = await product.save()

        return res.status(200).json({
            success : true,
            error : false,
            message : "Product Added Successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            error : true,
            message : error.message || error
        })
    }
}

const getAllProductsController = async (req, res) => {
    try {
        let { page, limit, search } = req.body

        if(!page){
            page = 1
        }

        if(!limit){
            limit = 25
        }

        const skip = (limit * (page - 1))
        const searchQuery = search ? { 
            $text : {
                $search : search
            }
         } : {}

        const [data, totalCount] = await Promise.all([
            productModel.find(searchQuery).sort({createdAt : -1}).skip(skip).limit(limit).populate('category subCategory'),
            productModel.countDocuments(searchQuery)
        ])

        if(!data || data.length === 0) {
            return res.status(200).json({
                success : true,
                error : false,
                message : "No Product Found",
                data : []
            })
        }

        return res.status(200).json({
            success : true,
            error : false,
            totalCount : totalCount,
            totalNoPage : Math.ceil(totalCount / limit),
            data : data
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            error : true,
            message : error?.message || error
        })
    }
}

const getProductByCategoryController = async (req, res) => {
    try {
        const { id } = req.body

        if(!id) {
            return res.status(400).json({
                success : false,
                error : true,
                message : "Category Id Required"
            })
        }

        const product = await productModel.find({
            category : { $in : id }
        }).limit(15)

        if(!product) {
            return res.status(400).json({
                success : false,
                error : true,
                message : "No Product Found"
            })
        }

        return res.status(200).json({
            success : true,
            error : false,
            data : product
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            error : true,
            message : error?.message || error
        })
    }
}

const getProductbySubcategory = async (req, res) => {
    try {
        let { category, subCategory, page = 1, limit = 25 } = req.body

        if(!category || !subCategory) {
            return res.status(400).json({
                success : false,
                error : true,
                message : "Category Id and SubCategory Id Required"
            })
        }

        const skip = (limit * (page - 1))

        const query = {
            category : { $in : category },
            subCategory : { $in : subCategory }
        }

        const [data, dataCount] = await Promise.all([
            productModel.find(query).sort({ createdAt : -1 }).skip(skip).limit(limit),
            productModel.countDocuments(query)
        ])

        if(!data || data.length === 0) {
            return res.status(200).json({
                message : "No Product Found",
                success : true,
                error : false,
                data : []
            })
        }

        return res.status(200).json({
            message : "Product Fetched Successfully",
            success : true,
            error : false,
            data : data,
            totalCount : dataCount,
            totalNoPage : Math.ceil(dataCount / limit),
            page : page,
        })
        
        
    } catch (error) {
        return res.status(500).json({
            success : false,
            error : true,
            message : error?.message || error
        })
    }
}

const getProductDetailsController = async (req, res) => {
    try {
        const { productId } = req.body

        const product = await productModel.findOne({ _id : productId})

        if(!product) {
            return res.status(404).json({
                message : "Product not found",
                success : false,
                error : true
            })
        }

        return res.status(200).json({
            message : 'Product Details',
            error : false,
            success : true,
            data : product
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            success : false,
            error : true
        })        
    }
}

const updateProductController = async (req, res) => {
    try {
        const { _id } = req.body

        if( !_id ){
            return res.status(200).json({
                message : "Product not exist",
                success : false,
                error : true
            })
        }

        const updateProduct = await productModel.updateOne({ _id : _id },{
            ...req.body
        })

        return res.json({
            message : "Product updated successfully",
            data : updateProduct,
            success : true,
            error : false
        })
    } catch (error) {
       return res.status(500).json({
        message : error.message || error,
        success : false,
        error : true
       }) 
    }
}

const deleteProductController = async (req, res) => {
    try {
        const { _id } = req.body

        if( !_id ){
            return res.status(400).json({
                message : "Product not exixt"
            })
        }

        const item = await productModel.findByIdAndDelete({ _id : _id })

        if( item ){
            return res.status(200).json({
                message : "Product Deleted Successfully",
                success : true,
                error : false,
                data : item
            })
        }

        return res.status(400).json({
            message : "Something went wrong ! Try Again",
            success : false,
            error : true
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            success : false,
            error : true
        })
    }
}

const searchProductController = async (req, res) => {
    try {
        let {search, page =1, limit=12 } = req.body

        const query = search ? {
            $text : {
                $search : search
            }
        } : {}

        const skip = (page - 1) * limit

        const [data, dataCount] = await Promise.all([
            productModel.find(query).sort({createdAt : -1}).skip(skip).limit(limit).populate('category subCategory'),
            productModel.countDocuments(query)
        ])

        if(!data || data.length === 0) {
            return res.status(200).json({
                message : "No Product Found",
                error : false,
                success : true,
                data : []
            })
        }

        return res.status(200).json({
            message : "Product Data",
            error : false,
            success : true,
            data : data,
            totalCount : dataCount,
            totalPage : Math.ceil(dataCount/limit),
            page : page,
            limit : limit
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            success : false,
            error : true
        })
    }
}

module.exports = { createProductController, getAllProductsController, getProductByCategoryController, getProductbySubcategory, getProductDetailsController, updateProductController, deleteProductController, searchProductController }